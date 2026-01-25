import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { eq, and, desc } from 'drizzle-orm';
import {
  createDb,
  skills,
  skillCreations,
  skillCreationSteps,
  skillCreationSources,
  skillCreationOutputs,
  type User,
} from '../db';
import { requireAuth } from '../middleware/auth';
import { generateId } from '../lib/utils';
import {
  buildTopSkillsContext,
  generateSkillWithClaude,
  generateSkillWithClaudeStreaming,
  generateClarifyQuestions,
  type GeneratedStep,
  type GeneratedSkill,
  type ClarifyQuestion,
  type ClarifyResponse,
} from '../services/skillComposer';
import type { ApiResponse } from '@agentskills/shared';

// Helper function to create a ZIP file containing SKILL.md
function createSkillZip(skillMdContent: string): Uint8Array {
  const skillMdBytes = new TextEncoder().encode(skillMdContent);
  const filename = 'SKILL.md';
  const filenameBytes = new TextEncoder().encode(filename);
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

  // CRC32 calculation
  const crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc32Table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < skillMdBytes.length; i++) {
    crc = crc32Table[(crc ^ skillMdBytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  crc = (crc ^ 0xFFFFFFFF) >>> 0;

  // Local file header
  const localHeader = new Uint8Array(30 + filenameBytes.length);
  const localView = new DataView(localHeader.buffer);
  localView.setUint32(0, 0x04034b50, true);
  localView.setUint16(4, 20, true);
  localView.setUint16(6, 0, true);
  localView.setUint16(8, 0, true);
  localView.setUint16(10, dosTime, true);
  localView.setUint16(12, dosDate, true);
  localView.setUint32(14, crc, true);
  localView.setUint32(18, skillMdBytes.length, true);
  localView.setUint32(22, skillMdBytes.length, true);
  localView.setUint16(26, filenameBytes.length, true);
  localView.setUint16(28, 0, true);
  localHeader.set(filenameBytes, 30);

  // Central directory header
  const centralHeader = new Uint8Array(46 + filenameBytes.length);
  const centralView = new DataView(centralHeader.buffer);
  centralView.setUint32(0, 0x02014b50, true);
  centralView.setUint16(4, 20, true);
  centralView.setUint16(6, 20, true);
  centralView.setUint16(8, 0, true);
  centralView.setUint16(10, 0, true);
  centralView.setUint16(12, dosTime, true);
  centralView.setUint16(14, dosDate, true);
  centralView.setUint32(16, crc, true);
  centralView.setUint32(20, skillMdBytes.length, true);
  centralView.setUint32(24, skillMdBytes.length, true);
  centralView.setUint16(28, filenameBytes.length, true);
  centralView.setUint16(30, 0, true);
  centralView.setUint16(32, 0, true);
  centralView.setUint16(34, 0, true);
  centralView.setUint16(36, 0, true);
  centralView.setUint32(38, 0, true);
  centralView.setUint32(42, 0, true);
  centralHeader.set(filenameBytes, 46);

  // End of central directory
  const centralDirOffset = localHeader.length + skillMdBytes.length;
  const centralDirSize = centralHeader.length;
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, 1, true);
  endView.setUint16(10, 1, true);
  endView.setUint32(12, centralDirSize, true);
  endView.setUint32(16, centralDirOffset, true);
  endView.setUint16(20, 0, true);

  // Combine all parts
  const zipBuffer = new Uint8Array(localHeader.length + skillMdBytes.length + centralHeader.length + endRecord.length);
  let offset = 0;
  zipBuffer.set(localHeader, offset); offset += localHeader.length;
  zipBuffer.set(skillMdBytes, offset); offset += skillMdBytes.length;
  zipBuffer.set(centralHeader, offset); offset += centralHeader.length;
  zipBuffer.set(endRecord, offset);

  return zipBuffer;
}

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  DEEPSEEK_BASE_URL: string;
  DEEPSEEK_API_KEY: string;
};

type Variables = {
  user: User;
};

// Response types
interface GenerateResponse {
  creationId: string;
  name: string;
  description: string;
  skillMd: string;
  steps: GeneratedStep[];
}

interface PublishResponse {
  skillId: string;
  url: string;
}

interface DraftItem {
  creationId: string;
  prompt: string;
  status: string;
  createdAt: number;
}

const composerRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All composer routes require auth
composerRouter.use('*', requireAuth);

// Rate limiting map (in-memory, resets on worker restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Clarify user requirements with interactive Q&A
composerRouter.post('/clarify', async (c) => {
  const user = c.get('user');

  // Rate limit check (lighter limit for clarify)
  if (!checkRateLimit(user.id)) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Rate limit exceeded. Max 10 generations per hour.' },
      429
    );
  }

  const body = await c.req.json<{
    prompt: string;
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  }>();

  const { prompt, conversationHistory = [] } = body;

  if (!prompt || prompt.length < 10) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Prompt must be at least 10 characters' },
      400
    );
  }

  try {
    const response = await generateClarifyQuestions(
      c.env.DEEPSEEK_BASE_URL,
      c.env.DEEPSEEK_API_KEY,
      prompt,
      conversationHistory
    );

    return c.json<ApiResponse<ClarifyResponse>>({
      data: response,
      error: null,
    });
  } catch (error) {
    console.error('Clarify error:', error);
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Failed to generate clarifying questions. Please try again.' },
      500
    );
  }
});

// Generate a new skill
composerRouter.post('/generate', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');

  // Rate limit check
  if (!checkRateLimit(user.id)) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Rate limit exceeded. Max 10 generations per hour.' },
      429
    );
  }

  // Parse request
  const body = await c.req.json<{ prompt: string; category?: string }>();
  const { prompt, category } = body;

  if (!prompt || prompt.length < 10) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Prompt must be at least 10 characters' },
      400
    );
  }

  if (prompt.length > 2000) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Prompt must be 2000 characters or less' },
      400
    );
  }

  try {
    // Build context from top skills
    const { context, skills: contextSkills } = await buildTopSkillsContext(db, category);

    // Generate skill with DeepSeek
    const generated = await generateSkillWithClaude(
      c.env.DEEPSEEK_BASE_URL,
      c.env.DEEPSEEK_API_KEY,
      prompt,
      context,
      contextSkills
    );

    // Create skill creation record
    const creationId = generateId();
    const now = new Date();

    await db.insert(skillCreations).values({
      id: creationId,
      userId: user.id,
      prompt,
      category: category || null,
      status: 'draft',
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Insert steps and sources
    for (const step of generated.steps) {
      const stepId = generateId();

      await db.insert(skillCreationSteps).values({
        id: stepId,
        creationId,
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        createdAt: now,
      });

      // Insert sources for this step (only if skill exists in DB)
      for (const source of step.sources) {
        // Verify the source skill exists before inserting
        const skillExists = await db.select({ id: skills.id })
          .from(skills)
          .where(eq(skills.id, source.skillId))
          .get();

        if (skillExists) {
          await db.insert(skillCreationSources).values({
            id: generateId(),
            stepId,
            sourceSkillId: source.skillId,
            reason: source.reason,
            createdAt: now,
          });
        }
      }
    }

    // Insert output
    await db.insert(skillCreationOutputs).values({
      id: generateId(),
      creationId,
      version: 1,
      skillMd: generated.skillMd,
      isEdited: false,
      createdAt: now,
    });

    // Filter steps to only include sources that exist in DB
    const filteredSteps = generated.steps.map(step => ({
      ...step,
      sources: step.sources.filter(source =>
        contextSkills.some(s => s.id === source.skillId)
      ),
    }));

    return c.json<ApiResponse<GenerateResponse>>({
      data: {
        creationId,
        name: generated.name,
        description: generated.description,
        skillMd: generated.skillMd,
        steps: filteredSteps,
      },
      error: null,
    });
  } catch (error) {
    console.error('Skill generation error:', error);
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Failed to generate skill. Please try again.' },
      500
    );
  }
});

// Generate a new skill with streaming progress
composerRouter.post('/generate/stream', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');

  // Rate limit check
  if (!checkRateLimit(user.id)) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Rate limit exceeded. Max 10 generations per hour.' },
      429
    );
  }

  // Parse request
  const body = await c.req.json<{ prompt: string; category?: string }>();
  const { prompt, category } = body;

  if (!prompt || prompt.length < 10) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Prompt must be at least 10 characters' },
      400
    );
  }

  if (prompt.length > 2000) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Prompt must be 2000 characters or less' },
      400
    );
  }

  return streamSSE(c, async (stream) => {
    try {
      // Phase 1: Build context
      await stream.writeSSE({
        data: JSON.stringify({ type: 'status', message: 'Analyzing top skills for inspiration...' }),
      });

      const { context, skills: contextSkills } = await buildTopSkillsContext(db, category);

      await stream.writeSSE({
        data: JSON.stringify({ type: 'status', message: `Found ${contextSkills.length} relevant skills` }),
      });

      // Phase 2: Generate with true streaming from LLM
      let generated: GeneratedSkill;
      const streamedSteps: GeneratedStep[] = [];
      let stepCount = 0;
      let lastSkillMdSent = '';

      try {
        generated = await generateSkillWithClaudeStreaming(
          c.env.DEEPSEEK_BASE_URL,
          c.env.DEEPSEEK_API_KEY,
          prompt,
          context,
          contextSkills,
          async (event) => {
            // Forward LLM progress events to the client
            await stream.writeSSE({
              data: JSON.stringify({ type: event.type, message: event.data || '' }),
            });
          },
          async (step) => {
            // Stream each step as it's extracted from LLM output
            streamedSteps.push(step);
            stepCount++;
            await stream.writeSSE({
              data: JSON.stringify({
                type: 'step',
                step,
                stepIndex: step.stepNumber - 1,
                totalSteps: stepCount, // Will be updated as more steps come
              }),
            });
          },
          async (chunk, fullSkillMd) => {
            // Stream skillMd content as it's generated
            lastSkillMdSent = fullSkillMd;
            await stream.writeSSE({
              data: JSON.stringify({
                type: 'skillMd',
                chunk,
                fullContent: fullSkillMd,
              }),
            });
          }
        );
      } catch (error) {
        console.error('Generation error:', error);
        await stream.writeSSE({
          data: JSON.stringify({ type: 'error', message: 'AI generation failed' }),
        });
        return;
      }

      // Update step count now that we know the total
      if (generated.steps.length > streamedSteps.length) {
        // Emit any steps that weren't streamed
        for (let i = streamedSteps.length; i < generated.steps.length; i++) {
          const step = generated.steps[i];
          await stream.writeSSE({
            data: JSON.stringify({
              type: 'step',
              step,
              stepIndex: i,
              totalSteps: generated.steps.length,
            }),
          });
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Phase 3: Save to database
      await stream.writeSSE({
        data: JSON.stringify({ type: 'status', message: 'Saving to database...' }),
      });

      const creationId = generateId();
      const now = new Date();

      await db.insert(skillCreations).values({
        id: creationId,
        userId: user.id,
        prompt,
        category: category || null,
        status: 'draft',
        generatedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      // Save steps to database (already streamed to client during generation)
      const filteredSteps: GeneratedStep[] = [];

      for (const step of generated.steps) {
        const stepId = generateId();

        await db.insert(skillCreationSteps).values({
          id: stepId,
          creationId,
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          createdAt: now,
        });

        // Filter sources to only include skills that exist in DB
        const filteredSources = step.sources.filter(source =>
          contextSkills.some(s => s.id === source.skillId)
        );

        for (const source of filteredSources) {
          await db.insert(skillCreationSources).values({
            id: generateId(),
            stepId,
            sourceSkillId: source.skillId,
            reason: source.reason,
            createdAt: now,
          });
        }

        const filteredStep = { ...step, sources: filteredSources };
        filteredSteps.push(filteredStep);
      }

      // Insert output
      await db.insert(skillCreationOutputs).values({
        id: generateId(),
        creationId,
        version: 1,
        skillMd: generated.skillMd,
        isEdited: false,
        createdAt: now,
      });

      // Send final result
      await stream.writeSSE({
        data: JSON.stringify({
          type: 'complete',
          result: {
            creationId,
            name: generated.name,
            description: generated.description,
            skillMd: generated.skillMd,
            steps: filteredSteps,
          },
        }),
      });
    } catch (error) {
      console.error('Streaming error:', error);
      await stream.writeSSE({
        data: JSON.stringify({ type: 'error', message: 'Generation failed. Please try again.' }),
      });
    }
  });
});

// Regenerate with feedback
composerRouter.post('/:creationId/regenerate', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');
  const creationId = c.req.param('creationId');

  // Rate limit check
  if (!checkRateLimit(user.id)) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Rate limit exceeded. Max 10 generations per hour.' },
      429
    );
  }

  // Verify ownership
  const creation = await db
    .select()
    .from(skillCreations)
    .where(and(eq(skillCreations.id, creationId), eq(skillCreations.userId, user.id)))
    .get();

  if (!creation) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Creation not found' }, 404);
  }

  const body = await c.req.json<{ feedback: string }>();
  const { feedback } = body;

  if (!feedback) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Feedback is required' }, 400);
  }

  try {
    // Build context
    const { context, skills: contextSkills } = await buildTopSkillsContext(
      db,
      creation.category || undefined
    );

    // Combine original prompt with feedback
    const enhancedPrompt = `${creation.prompt}\n\nAdditional requirements: ${feedback}`;

    // Generate with DeepSeek
    const generated = await generateSkillWithClaude(
      c.env.DEEPSEEK_BASE_URL,
      c.env.DEEPSEEK_API_KEY,
      enhancedPrompt,
      context,
      contextSkills
    );

    const now = new Date();

    // Delete old steps and sources
    const oldSteps = await db
      .select()
      .from(skillCreationSteps)
      .where(eq(skillCreationSteps.creationId, creationId));

    for (const step of oldSteps) {
      await db.delete(skillCreationSources).where(eq(skillCreationSources.stepId, step.id));
    }
    await db.delete(skillCreationSteps).where(eq(skillCreationSteps.creationId, creationId));

    // Insert new steps and sources
    for (const step of generated.steps) {
      const stepId = generateId();

      await db.insert(skillCreationSteps).values({
        id: stepId,
        creationId,
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        createdAt: now,
      });

      for (const source of step.sources) {
        // Verify the source skill exists before inserting
        const skillExists = await db.select({ id: skills.id })
          .from(skills)
          .where(eq(skills.id, source.skillId))
          .get();

        if (skillExists) {
          await db.insert(skillCreationSources).values({
            id: generateId(),
            stepId,
            sourceSkillId: source.skillId,
            reason: source.reason,
            createdAt: now,
          });
        }
      }
    }

    // Get current max version
    const outputs = await db
      .select()
      .from(skillCreationOutputs)
      .where(eq(skillCreationOutputs.creationId, creationId))
      .orderBy(desc(skillCreationOutputs.version));

    const nextVersion = (outputs[0]?.version || 0) + 1;

    // Insert new output
    await db.insert(skillCreationOutputs).values({
      id: generateId(),
      creationId,
      version: nextVersion,
      skillMd: generated.skillMd,
      isEdited: false,
      createdAt: now,
    });

    // Update creation timestamp
    await db
      .update(skillCreations)
      .set({ updatedAt: now, generatedAt: now })
      .where(eq(skillCreations.id, creationId));

    // Filter steps to only include sources that exist in DB
    const filteredSteps = generated.steps.map(step => ({
      ...step,
      sources: step.sources.filter(source =>
        contextSkills.some(s => s.id === source.skillId)
      ),
    }));

    return c.json<ApiResponse<GenerateResponse>>({
      data: {
        creationId,
        name: generated.name,
        description: generated.description,
        skillMd: generated.skillMd,
        steps: filteredSteps,
      },
      error: null,
    });
  } catch (error) {
    console.error('Regeneration error:', error);
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Failed to regenerate skill. Please try again.' },
      500
    );
  }
});

// Save edited SKILL.md content
composerRouter.put('/:creationId', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');
  const creationId = c.req.param('creationId');

  // Verify ownership
  const creation = await db
    .select()
    .from(skillCreations)
    .where(and(eq(skillCreations.id, creationId), eq(skillCreations.userId, user.id)))
    .get();

  if (!creation) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Creation not found' }, 404);
  }

  const body = await c.req.json<{ skillMd: string }>();
  const { skillMd } = body;

  if (!skillMd) {
    return c.json<ApiResponse<null>>({ data: null, error: 'skillMd is required' }, 400);
  }

  const now = new Date();

  // Get latest output and update or create new
  const latestOutput = await db
    .select()
    .from(skillCreationOutputs)
    .where(eq(skillCreationOutputs.creationId, creationId))
    .orderBy(desc(skillCreationOutputs.version))
    .get();

  if (latestOutput) {
    await db
      .update(skillCreationOutputs)
      .set({ skillMd, isEdited: true })
      .where(eq(skillCreationOutputs.id, latestOutput.id));
  } else {
    await db.insert(skillCreationOutputs).values({
      id: generateId(),
      creationId,
      version: 1,
      skillMd,
      isEdited: true,
      createdAt: now,
    });
  }

  await db
    .update(skillCreations)
    .set({ updatedAt: now })
    .where(eq(skillCreations.id, creationId));

  return c.json<ApiResponse<{ saved: boolean }>>({
    data: { saved: true },
    error: null,
  });
});

// Publish skill to marketplace
composerRouter.post('/:creationId/publish', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');
  const creationId = c.req.param('creationId');

  // Verify ownership and status
  const creation = await db
    .select()
    .from(skillCreations)
    .where(and(eq(skillCreations.id, creationId), eq(skillCreations.userId, user.id)))
    .get();

  if (!creation) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Creation not found' }, 404);
  }

  if (creation.status === 'published') {
    return c.json<ApiResponse<null>>({ data: null, error: 'Already published' }, 400);
  }

  const body = await c.req.json<{ name: string; description: string; visibility?: 'public' | 'private' }>();
  const { name, description, visibility = 'public' } = body;

  if (!name || !description) {
    return c.json<ApiResponse<null>>(
      { data: null, error: 'Name and description are required' },
      400
    );
  }

  // Get latest output
  const latestOutput = await db
    .select()
    .from(skillCreationOutputs)
    .where(eq(skillCreationOutputs.creationId, creationId))
    .orderBy(desc(skillCreationOutputs.version))
    .get();

  if (!latestOutput) {
    return c.json<ApiResponse<null>>({ data: null, error: 'No generated content found' }, 400);
  }

  const now = new Date();
  const skillId = generateId();
  const r2FileKey = `user-created/${skillId}/skill.zip`;

  // Create ZIP file for the skill
  const zipBuffer = createSkillZip(latestOutput.skillMd);

  // Upload to R2 (for both public and private - enables download)
  try {
    await c.env.BUCKET.put(r2FileKey, zipBuffer, {
      httpMetadata: {
        contentType: 'application/zip',
      },
    });
  } catch (err) {
    console.error('Failed to upload to R2:', err);
    // Continue anyway - download will fall back to on-the-fly generation
  }

  // Create skill in marketplace
  await db.insert(skills).values({
    id: skillId,
    name,
    description,
    author: user.name,
    authorAvatarUrl: user.avatarUrl,
    creatorId: user.id,
    visibility,
    githubUrl: `https://agentskills.cv/skills/${skillId}`, // Self-referencing URL
    starsCount: 0,
    forksCount: 0,
    category: creation.category || 'other',
    r2FileKey,
    fileSize: zipBuffer.length,
    downloadCount: 0,
    viewCount: 0,
    avgRating: 0,
    ratingCount: 0,
    skillMdContent: latestOutput.skillMd,
    createdAt: now,
    updatedAt: now,
  });

  // Update creation status
  await db
    .update(skillCreations)
    .set({
      status: 'published',
      publishedAt: now,
      skillId,
      updatedAt: now,
    })
    .where(eq(skillCreations.id, creationId));

  return c.json<ApiResponse<PublishResponse>>({
    data: {
      skillId,
      url: `/skills/${skillId}`,
    },
    error: null,
  });
});

// List user's drafts
composerRouter.get('/drafts', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');

  const drafts = await db
    .select()
    .from(skillCreations)
    .where(and(eq(skillCreations.userId, user.id), eq(skillCreations.status, 'draft')))
    .orderBy(desc(skillCreations.updatedAt));

  const draftItems: DraftItem[] = drafts.map((d) => ({
    creationId: d.id,
    prompt: d.prompt,
    status: d.status,
    createdAt: d.createdAt.getTime(),
  }));

  return c.json<ApiResponse<DraftItem[]>>({
    data: draftItems,
    error: null,
  });
});

// Get a specific creation with full details
composerRouter.get('/:creationId', async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get('user');
  const creationId = c.req.param('creationId');

  // Verify ownership
  const creation = await db
    .select()
    .from(skillCreations)
    .where(and(eq(skillCreations.id, creationId), eq(skillCreations.userId, user.id)))
    .get();

  if (!creation) {
    return c.json<ApiResponse<null>>({ data: null, error: 'Creation not found' }, 404);
  }

  // Get steps with sources
  const steps = await db
    .select()
    .from(skillCreationSteps)
    .where(eq(skillCreationSteps.creationId, creationId))
    .orderBy(skillCreationSteps.stepNumber);

  const stepsWithSources: GeneratedStep[] = [];

  for (const step of steps) {
    const sources = await db
      .select({
        source: skillCreationSources,
        skill: skills,
      })
      .from(skillCreationSources)
      .innerJoin(skills, eq(skillCreationSources.sourceSkillId, skills.id))
      .where(eq(skillCreationSources.stepId, step.id));

    stepsWithSources.push({
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      sources: sources.map((s) => ({
        skillId: s.source.sourceSkillId,
        skillName: s.skill.name,
        stars: s.skill.starsCount || 0,
        forks: s.skill.forksCount || 0,
        reason: s.source.reason,
      })),
    });
  }

  // Get latest output
  const latestOutput = await db
    .select()
    .from(skillCreationOutputs)
    .where(eq(skillCreationOutputs.creationId, creationId))
    .orderBy(desc(skillCreationOutputs.version))
    .get();

  return c.json<ApiResponse<GenerateResponse>>({
    data: {
      creationId,
      name: '', // Extracted from skillMd in frontend
      description: '',
      skillMd: latestOutput?.skillMd || '',
      steps: stepsWithSources,
    },
    error: null,
  });
});

export { composerRouter };
