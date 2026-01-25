import { desc, sql } from 'drizzle-orm';
import { createDb, skills, type Skill } from '../db';
import { generateId } from '../lib/utils';

// Types for AI response
export interface GeneratedStep {
  stepNumber: number;
  title: string;
  description: string;
  sources: {
    skillId: string;
    skillName: string;
    views: number;
    rating: number;
    reason: string;
  }[];
}

export interface GeneratedSkill {
  name: string;
  description: string;
  skillMd: string;
  steps: GeneratedStep[];
}

// Types for clarification flow
export interface ClarifyQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
}

export interface ClarifyResponse {
  questions: ClarifyQuestion[];
  isComplete: boolean;
  refinedPrompt?: string;
  summary?: string;
}

// Build context from top skills for Claude
export async function buildTopSkillsContext(
  db: ReturnType<typeof createDb>,
  category?: string,
  limit = 15
): Promise<{ context: string; skills: Skill[] }> {
  // Fetch top skills by rating and views
  let query = db
    .select()
    .from(skills)
    .orderBy(desc(sql`(${skills.avgRating} * 0.4 + LOG(${skills.viewCount} + 1) * 0.6)`))
    .limit(limit);

  const topSkills = await query;

  // Filter by category if provided
  const filteredSkills = category
    ? topSkills.filter(s => s.category.toLowerCase() === category.toLowerCase())
    : topSkills;

  // If category filter left too few, use all top skills
  const skillsToUse = filteredSkills.length >= 5 ? filteredSkills : topSkills.slice(0, limit);

  // Format as context string
  const context = skillsToUse
    .map(s => `
--- SKILL: ${s.name} (ID: ${s.id}) ---
Category: ${s.category}
Views: ${s.viewCount || 0} | Rating: ${s.avgRating?.toFixed(1) || 'N/A'}
Description: ${s.description}

SKILL.md Content:
${s.skillMdContent || 'No content available'}
---`)
    .join('\n\n');

  return { context, skills: skillsToUse };
}

// System prompt for skill generation
const SYSTEM_PROMPT = `You are an expert AI skill designer for Claude Code. Your task is to generate high-quality SKILL.md files based on user requests.

You have access to top-rated skills from the marketplace. For each step in your generated skill's workflow:
1. Identify which existing skill(s) best inform this step
2. Extract relevant patterns, structures, or approaches
3. Explain WHY you're utilizing that skill (what specific part or pattern)

IMPORTANT: Always output valid JSON in exactly this format. NOTE: Output "steps" BEFORE "skillMd" so workflow steps appear early:
{
  "name": "Skill Name",
  "description": "One-line description of what this skill does",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step Title",
      "description": "What this step does in 1-2 sentences",
      "sources": [
        {
          "skillId": "the-skill-id-from-context",
          "reason": "Specific explanation of what pattern/technique is being utilized from this skill"
        }
      ]
    }
  ],
  "skillMd": "Full SKILL.md content as a string with proper markdown formatting. Use \\n for newlines."
}

CRITICAL - SKILL.md Format Requirements:
The skillMd content MUST start with YAML frontmatter in this exact format:

---
name: skill-name-here
description: "One-line description in quotes. When Claude needs to..."
---

# Skill Title

... rest of the skill content ...

The YAML frontmatter is MANDATORY. The fields are:
- name: Short identifier for the skill (kebab-case recommended)
- description: One-line description explaining when Claude should use this skill
- license: OPTIONAL - only include if user specifies a license preference

After the frontmatter, include:
- A clear # Title heading
- Brief introduction paragraph
- "## When to Use" section listing specific scenarios
- "## Workflow" section describing the step-by-step process
- "## Example Usage" with practical code blocks or examples
- Keep it concise but comprehensive`;

// Call DeepSeek API to generate skill with streaming
export async function generateSkillWithClaudeStreaming(
  baseUrl: string,
  authToken: string,
  prompt: string,
  skillsContext: string,
  contextSkills: Skill[],
  onProgress: (event: { type: string; data?: string }) => Promise<void>,
  onStep?: (step: GeneratedStep) => Promise<void>,
  onSkillMdChunk?: (chunk: string, fullContent: string) => Promise<void>
): Promise<GeneratedSkill> {
  const userMessage = `Here are top-rated skills from the marketplace for reference:

${skillsContext}

---

User Request: ${prompt}

Generate a high-quality skill based on this request. Use the existing skills above as inspiration and reference them in your steps.`;

  // DeepSeek uses OpenAI-compatible endpoint
  const apiUrl = baseUrl.endsWith('/')
    ? `${baseUrl}chat/completions`
    : `${baseUrl}/chat/completions`;

  await onProgress({ type: 'status', data: 'Connecting to AI...' });

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 8192,
      stream: true,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('DeepSeek API error:', error);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let fullContent = '';
  let reasoningTokens = 0;
  let lastProgressTime = Date.now();
  let phase: 'thinking' | 'generating' = 'thinking';
  let buffer = ''; // Buffer for incomplete SSE lines
  let emittedStepCount = 0; // Track how many steps we've emitted
  let lastSkillMdLength = 0; // Track skillMd streaming progress
  let lastSkillMdSentLength = 0; // Track what we've actually sent
  let skillMdStarted = false; // Track if we've started the skillMd section
  let lastSkillMdSendTime = 0; // Throttle skillMd sends

  await onProgress({ type: 'thinking', data: 'AI is analyzing your request...' });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Append new chunk to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      // Keep the last potentially incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('data:')) continue;

        const data = trimmedLine.slice(5).trim();
        if (!data || data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;

          if (delta?.reasoning_content) {
            reasoningTokens++;

            // Send periodic thinking updates
            const now = Date.now();
            if (now - lastProgressTime > 800) {
              lastProgressTime = now;
              const stages = [
                'Analyzing skill patterns...',
                'Understanding requirements...',
                'Planning skill structure...',
                'Designing workflow steps...',
                'Preparing skill content...',
              ];
              const stageIndex = Math.min(Math.floor(reasoningTokens / 100), stages.length - 1);
              await onProgress({ type: 'thinking', data: stages[stageIndex] });
            }
          }

          if (delta?.content) {
            fullContent += delta.content;

            if (phase === 'thinking') {
              phase = 'generating';
              await onProgress({ type: 'generating', data: 'Starting to build skill...' });
            }

            // Try to extract and emit steps as they're generated
            if (onStep) {
              const stepsEmitted = await tryEmitSteps(fullContent, emittedStepCount, contextSkills, onStep);
              if (stepsEmitted > emittedStepCount) {
                emittedStepCount = stepsEmitted;
                lastProgressTime = Date.now();
                await onProgress({ type: 'generating', data: `Building step ${emittedStepCount}...` });
              }
            }

            // Try to stream skillMd content as it's generated (batched by section)
            if (onSkillMdChunk) {
              const skillMdContent = tryExtractSkillMd(fullContent);
              if (skillMdContent && skillMdContent.length > lastSkillMdLength) {
                lastSkillMdLength = skillMdContent.length;

                if (!skillMdStarted) {
                  skillMdStarted = true;
                  await onProgress({ type: 'generating', data: 'Writing SKILL.md content...' });
                }

                // Check if we should send a batch
                const pendingContent = skillMdContent.substring(lastSkillMdSentLength);
                const now = Date.now();
                const timeSinceLastSend = now - lastSkillMdSendTime;

                // Send when we have a complete section (double newline),
                // or enough content (150+ chars), or enough time passed (400ms)
                const hasCompleteSection = pendingContent.includes('\n\n') || pendingContent.includes('##');
                const hasEnoughContent = pendingContent.length >= 150;
                const enoughTimePassed = timeSinceLastSend >= 400 && pendingContent.length > 20;

                if (hasCompleteSection || hasEnoughContent || enoughTimePassed) {
                  // Find a good breaking point (prefer section breaks)
                  let sendUpTo = pendingContent.length;

                  // Try to break at section boundary
                  const sectionBreak = pendingContent.lastIndexOf('\n\n');
                  if (sectionBreak > 50) {
                    sendUpTo = sectionBreak + 2; // Include the newlines
                  } else {
                    // Try to break at line boundary
                    const lineBreak = pendingContent.lastIndexOf('\n');
                    if (lineBreak > 30) {
                      sendUpTo = lineBreak + 1;
                    }
                  }

                  const chunkToSend = pendingContent.substring(0, sendUpTo);
                  const newSentLength = lastSkillMdSentLength + sendUpTo;

                  await onSkillMdChunk(chunkToSend, skillMdContent.substring(0, newSentLength));
                  lastSkillMdSentLength = newSentLength;
                  lastSkillMdSendTime = now;
                }
              }
            }

            // Send periodic generating updates (if no step was just emitted and not in skillMd phase)
            const now = Date.now();
            if (now - lastProgressTime > 1200 && emittedStepCount === 0 && !skillMdStarted) {
              lastProgressTime = now;
              // Check what we're generating
              const hasName = fullContent.includes('"name"');
              const hasDesc = fullContent.includes('"description"');
              const hasSteps = fullContent.includes('"steps"');

              if (hasSteps) {
                await onProgress({ type: 'generating', data: 'Building workflow steps...' });
              } else if (hasDesc) {
                await onProgress({ type: 'generating', data: 'Defining skill details...' });
              } else if (hasName) {
                const nameMatch = fullContent.match(/"name":\s*"([^"]+)"/);
                if (nameMatch) {
                  await onProgress({ type: 'generating', data: `Creating: ${nameMatch[1]}` });
                }
              }
            }
          }
        } catch {
          // Ignore parse errors for incomplete SSE data
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Send any remaining skillMd content that wasn't sent yet
  if (onSkillMdChunk && lastSkillMdLength > lastSkillMdSentLength) {
    const skillMdContent = tryExtractSkillMd(fullContent);
    if (skillMdContent) {
      const remainingChunk = skillMdContent.substring(lastSkillMdSentLength);
      if (remainingChunk.length > 0) {
        await onSkillMdChunk(remainingChunk, skillMdContent);
      }
    }
  }

  await onProgress({ type: 'status', data: 'Finalizing skill...' });

  // Parse JSON from response - look for JSON object with "name" field
  const jsonStartMatch = fullContent.match(/\{\s*"name"/);
  if (!jsonStartMatch) {
    console.error('DeepSeek response (no name field):', fullContent.substring(0, 500));
    throw new Error('No valid skill JSON found in AI response');
  }

  const jsonStart = fullContent.indexOf(jsonStartMatch[0]);

  // Find matching closing brace by counting braces
  let braceCount = 0;
  let jsonEnd = -1;
  for (let i = jsonStart; i < fullContent.length; i++) {
    if (fullContent[i] === '{') braceCount++;
    if (fullContent[i] === '}') braceCount--;
    if (braceCount === 0) {
      jsonEnd = i + 1;
      break;
    }
  }

  if (jsonEnd === -1) {
    console.error('DeepSeek response (incomplete JSON):', fullContent.substring(0, 500));
    throw new Error('Incomplete skill JSON in AI response');
  }

  const jsonStr = fullContent.substring(jsonStart, jsonEnd);

  let parsed: {
    name: string;
    description: string;
    skillMd: string;
    steps: {
      stepNumber: number;
      title: string;
      description: string;
      sources: { skillId: string; reason: string }[];
    }[];
  };

  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parse error:', e);
    console.error('Attempted to parse:', jsonStr.substring(0, 500));
    throw new Error('Failed to parse skill JSON from AI response');
  }

  // Enrich sources with skill metadata
  const enrichedSteps: GeneratedStep[] = parsed.steps.map(step => ({
    ...step,
    sources: step.sources.map(source => {
      const skill = contextSkills.find(s => s.id === source.skillId);
      return {
        skillId: source.skillId,
        skillName: skill?.name || 'Unknown Skill',
        views: skill?.viewCount || 0,
        rating: skill?.avgRating || 0,
        reason: source.reason,
      };
    }),
  }));

  return {
    name: parsed.name,
    description: parsed.description,
    skillMd: parsed.skillMd,
    steps: enrichedSteps,
  };
}

// Helper function to extract skillMd content from partial JSON stream
function tryExtractSkillMd(content: string): string | null {
  // Look for "skillMd": " pattern
  const skillMdMatch = content.match(/"skillMd"\s*:\s*"/);
  if (!skillMdMatch) return null;

  const skillMdStart = content.indexOf(skillMdMatch[0]) + skillMdMatch[0].length;
  const remaining = content.substring(skillMdStart);

  // Find the end of the string (unescaped quote)
  let result = '';
  let i = 0;
  while (i < remaining.length) {
    if (remaining[i] === '\\' && i + 1 < remaining.length) {
      // Handle escape sequences
      const nextChar = remaining[i + 1];
      if (nextChar === 'n') {
        result += '\n';
      } else if (nextChar === 't') {
        result += '\t';
      } else if (nextChar === '"') {
        result += '"';
      } else if (nextChar === '\\') {
        result += '\\';
      } else {
        result += nextChar;
      }
      i += 2;
    } else if (remaining[i] === '"') {
      // End of string found
      break;
    } else {
      result += remaining[i];
      i++;
    }
  }

  return result || null;
}

// Helper function to extract and emit steps from partial JSON
async function tryEmitSteps(
  content: string,
  alreadyEmitted: number,
  contextSkills: Skill[],
  onStep: (step: GeneratedStep) => Promise<void>
): Promise<number> {
  // Look for the steps array
  const stepsMatch = content.match(/"steps"\s*:\s*\[/);
  if (!stepsMatch) return alreadyEmitted;

  const stepsStart = content.indexOf(stepsMatch[0]) + stepsMatch[0].length;
  const stepsContent = content.substring(stepsStart);

  // Try to extract complete step objects
  let emitted = alreadyEmitted;
  let searchStart = 0;

  // Find step objects by looking for stepNumber patterns
  const stepPattern = /\{\s*"stepNumber"\s*:\s*(\d+)/g;
  let match;

  while ((match = stepPattern.exec(stepsContent)) !== null) {
    const stepNumber = parseInt(match[1], 10);

    // Skip already emitted steps
    if (stepNumber <= emitted) {
      searchStart = match.index + match[0].length;
      continue;
    }

    // Try to find the complete step object
    const stepStart = match.index;
    let braceCount = 0;
    let stepEnd = -1;

    for (let i = stepStart; i < stepsContent.length; i++) {
      if (stepsContent[i] === '{') braceCount++;
      if (stepsContent[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          stepEnd = i + 1;
          break;
        }
      }
    }

    if (stepEnd === -1) {
      // Step is incomplete, stop here
      break;
    }

    // Try to parse this step
    const stepJson = stepsContent.substring(stepStart, stepEnd);
    try {
      const step = JSON.parse(stepJson) as {
        stepNumber: number;
        title: string;
        description: string;
        sources: { skillId: string; reason: string }[];
      };

      // Enrich with skill metadata
      const enrichedStep: GeneratedStep = {
        ...step,
        sources: (step.sources || []).map(source => {
          const skill = contextSkills.find(s => s.id === source.skillId);
          return {
            skillId: source.skillId,
            skillName: skill?.name || 'Unknown Skill',
            views: skill?.viewCount || 0,
            rating: skill?.avgRating || 0,
            reason: source.reason,
          };
        }),
      };

      // Emit this step
      await onStep(enrichedStep);
      emitted = stepNumber;

      // Add small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 400));

    } catch {
      // Step JSON is invalid/incomplete, continue searching
    }

    searchStart = stepEnd;
  }

  return emitted;
}

// Call DeepSeek API to generate skill (OpenAI-compatible format)
export async function generateSkillWithClaude(
  baseUrl: string,
  authToken: string,
  prompt: string,
  skillsContext: string,
  contextSkills: Skill[]
): Promise<GeneratedSkill> {
  const userMessage = `Here are top-rated skills from the marketplace for reference:

${skillsContext}

---

User Request: ${prompt}

Generate a high-quality skill based on this request. Use the existing skills above as inspiration and reference them in your steps.`;

  // DeepSeek uses OpenAI-compatible endpoint
  const apiUrl = baseUrl.endsWith('/')
    ? `${baseUrl}chat/completions`
    : `${baseUrl}/chat/completions`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 8192,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('DeepSeek API error:', error);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const result = await response.json() as {
    choices: { message: { content: string; reasoning_content?: string } }[];
  };

  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content in DeepSeek response');
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('DeepSeek response:', content);
    throw new Error('No valid JSON found in DeepSeek response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    name: string;
    description: string;
    skillMd: string;
    steps: {
      stepNumber: number;
      title: string;
      description: string;
      sources: { skillId: string; reason: string }[];
    }[];
  };

  // Enrich sources with skill metadata
  const enrichedSteps: GeneratedStep[] = parsed.steps.map(step => ({
    ...step,
    sources: step.sources.map(source => {
      const skill = contextSkills.find(s => s.id === source.skillId);
      return {
        skillId: source.skillId,
        skillName: skill?.name || 'Unknown Skill',
        views: skill?.viewCount || 0,
        rating: skill?.avgRating || 0,
        reason: source.reason,
      };
    }),
  }));

  return {
    name: parsed.name,
    description: parsed.description,
    skillMd: parsed.skillMd,
    steps: enrichedSteps,
  };
}

// System prompt for clarification questions
const CLARIFY_SYSTEM_PROMPT = `You are a product requirements analyst helping users clarify their skill creation requests.

Your task is to ask clarifying questions to better understand what the user wants to build. Based on the conversation history, either:
1. Ask 1-3 focused clarifying questions if the requirements are unclear
2. Indicate the requirements are complete and provide a refined prompt summary

IMPORTANT: Output valid JSON in exactly this format:
{
  "isComplete": false,
  "questions": [
    {
      "id": "q1",
      "question": "What is your primary use case?",
      "type": "single",
      "options": ["Option A", "Option B", "Option C"]
    }
  ]
}

OR if requirements are clear:
{
  "isComplete": true,
  "refinedPrompt": "A detailed, refined version of the user's request incorporating all gathered information",
  "summary": "Brief summary of what will be built"
}

Question types:
- "single": Single choice from options
- "multiple": Multiple choice from options
- "text": Free text input (no options needed)

Guidelines:
- Ask about: target users, main functionality, key constraints, integration points
- Prefer multiple choice questions when possible (faster to answer)
- Maximum 3 questions per round
- IMPORTANT: Always ask at least 2 rounds of questions before marking isComplete as true
- Only set isComplete to true after the user has answered questions in at least 2 separate rounds
- Focus on actionable requirements, not philosophical discussions`;

// Generate clarifying questions
export async function generateClarifyQuestions(
  baseUrl: string,
  authToken: string,
  initialPrompt: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<ClarifyResponse> {
  const apiUrl = baseUrl.endsWith('/')
    ? `${baseUrl}chat/completions`
    : `${baseUrl}/chat/completions`;

  const messages = [
    { role: 'system', content: CLARIFY_SYSTEM_PROMPT },
    { role: 'user', content: `Initial request: ${initialPrompt}` },
    ...conversationHistory,
  ];

  // If we've had enough rounds, force completion
  const userRounds = conversationHistory.filter(m => m.role === 'user').length;
  if (userRounds >= 3) {
    messages.push({
      role: 'user',
      content: 'Please finalize the requirements now and set isComplete to true.',
    });
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat', // Use faster non-reasoning model for Q&A
      max_tokens: 1024,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('DeepSeek API error:', error);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const result = await response.json() as {
    choices: { message: { content: string } }[];
  };

  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content in DeepSeek response');
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('DeepSeek response:', content);
    throw new Error('No valid JSON found in DeepSeek response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as ClarifyResponse;

  // Force at least 2 rounds of questions before allowing completion
  // userRounds is already calculated above
  if (parsed.isComplete && userRounds < 1) {
    // Override - need at least 1 round of answers before completing
    return {
      isComplete: false,
      questions: parsed.questions || [
        {
          id: 'q_followup',
          question: 'What specific features or capabilities would you like this skill to have?',
          type: 'text' as const,
        },
      ],
    };
  }

  return parsed;
}
