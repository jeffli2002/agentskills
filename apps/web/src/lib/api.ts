import type { ApiResponse, PaginatedResponse, Skill, SkillsQueryParams, User, RelatedSkill, SkillFile } from '@agentskills/shared';

export const API_BASE = '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // Include cookies for cross-origin requests
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export async function getCurrentUser(): Promise<User | null> {
  const response = await fetchApi<ApiResponse<User>>('/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  await fetchApi('/auth/logout', { method: 'POST' });
}

// Skills
export async function getSkills(params?: SkillsQueryParams): Promise<PaginatedResponse<Skill>> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.set('q', params.q);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const query = searchParams.toString();
  return fetchApi<PaginatedResponse<Skill>>(`/skills${query ? `?${query}` : ''}`);
}

export async function getSkill(id: string): Promise<Skill | null> {
  const response = await fetchApi<ApiResponse<Skill>>(`/skills/${id}`);
  return response.data;
}

export async function getCategories(): Promise<string[]> {
  const response = await fetchApi<ApiResponse<string[]>>('/categories');
  return response.data || [];
}

export async function getCategoriesWithCounts(): Promise<{ category: string; count: number }[]> {
  const response = await fetchApi<ApiResponse<{ category: string; count: number }[]>>('/skills/meta/categories');
  return response.data || [];
}

export function getDownloadUrl(skillId: string): string {
  return `${API_BASE}/skills/${skillId}/download`;
}

// OpenClaw Export
export function getOpenClawExportUrl(skillId: string): string {
  return `${API_BASE}/skills/${skillId}/export/openclaw`;
}

export async function getOpenClawExport(skillId: string): Promise<{ content: string; name: string }> {
  const res = await fetch(getOpenClawExportUrl(skillId), { credentials: 'include' });
  if (!res.ok) throw new Error('Export failed');
  const content = await res.text();
  const name = res.headers.get('X-OpenClaw-Name') || 'skill';
  return { content, name };
}

// My Skills (user's created skills)
export async function getMySkills(): Promise<Skill[]> {
  const response = await fetchApi<ApiResponse<Skill[]>>('/skills/my');
  return response.data || [];
}

// Favorites
export async function getFavorites(): Promise<Skill[]> {
  const response = await fetchApi<ApiResponse<Skill[]>>('/favorites');
  return response.data || [];
}

export async function addFavorite(skillId: string): Promise<boolean> {
  const response = await fetchApi<ApiResponse<{ favorited: boolean }>>(`/favorites/${skillId}`, {
    method: 'POST',
  });
  return response.data?.favorited || false;
}

export async function removeFavorite(skillId: string): Promise<boolean> {
  const response = await fetchApi<ApiResponse<{ favorited: boolean }>>(`/favorites/${skillId}`, {
    method: 'DELETE',
  });
  return !response.data?.favorited;
}

// Ratings
export async function rateSkill(skillId: string, score: number): Promise<{ avgRating: number; ratingCount: number }> {
  const response = await fetchApi<ApiResponse<{ rating: number; avgRating: number; ratingCount: number }>>(
    `/ratings/${skillId}`,
    {
      method: 'POST',
      body: JSON.stringify({ score }),
    }
  );
  return { avgRating: response.data?.avgRating || 0, ratingCount: response.data?.ratingCount || 0 };
}

// Related Skills
export async function getRelatedSkills(skillId: string, category: string): Promise<RelatedSkill[]> {
  const response = await fetchApi<ApiResponse<RelatedSkill[]>>(`/skills/${skillId}/related`);
  return response.data || [];
}

// Parse skill files from JSON
export function parseSkillFiles(filesJson: string | null): SkillFile[] {
  if (!filesJson) return [];
  try {
    return JSON.parse(filesJson) as SkillFile[];
  } catch {
    return [];
  }
}

// Parse skill metadata from JSON
export function parseSkillMetadata(metadataJson: string | null): Record<string, string> | null {
  if (!metadataJson) return null;
  try {
    return JSON.parse(metadataJson) as Record<string, string>;
  } catch {
    return null;
  }
}

// Skill Composer Types
export interface GeneratedResource {
  path: string;
  content: string;
  description: string;
}

export interface GeneratedStep {
  stepNumber: number;
  title: string;
  description: string;
  sources: {
    skillId: string;
    skillName: string;
    stars: number;
    forks: number;
    reason: string;
  }[];
}

export interface GenerateResponse {
  creationId: string;
  name: string;
  description: string;
  skillMd: string;
  steps: GeneratedStep[];
  resources?: GeneratedResource[];
}

export interface DraftItem {
  creationId: string;
  prompt: string;
  status: string;
  createdAt: number;
}

// Clarification types
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

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Skill Composer API
export async function clarifyRequirements(
  prompt: string,
  conversationHistory: ConversationMessage[] = []
): Promise<ClarifyResponse> {
  const response = await fetchApi<ApiResponse<ClarifyResponse>>('/composer/clarify', {
    method: 'POST',
    body: JSON.stringify({ prompt, conversationHistory }),
  });
  if (!response.data) throw new Error(response.error || 'Failed to clarify requirements');
  return response.data;
}

export async function generateSkill(prompt: string, category?: string): Promise<GenerateResponse> {
  const response = await fetchApi<ApiResponse<GenerateResponse>>('/composer/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, category }),
  });
  if (!response.data) throw new Error(response.error || 'Failed to generate skill');
  return response.data;
}

export interface StreamProgress {
  type: 'status' | 'thinking' | 'generating' | 'error';
  message: string;
}

export interface StreamStep {
  type: 'step';
  step: GeneratedStep;
  stepIndex: number;
  totalSteps: number;
}

export interface StreamSkillMd {
  type: 'skillMd';
  chunk: string;
  fullContent: string;
}

export interface StreamResult {
  type: 'complete';
  result: GenerateResponse & { resources?: GeneratedResource[] };
}

export async function generateSkillStreaming(
  prompt: string,
  category: string | undefined,
  onProgress: (progress: StreamProgress) => void,
  onStep?: (step: GeneratedStep, stepIndex: number, totalSteps: number) => void,
  onSkillMd?: (chunk: string, fullContent: string) => void
): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/composer/generate/stream`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, category }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'complete') {
              return parsed.result as GenerateResponse;
            } else if (parsed.type === 'step' && onStep) {
              onStep(parsed.step as GeneratedStep, parsed.stepIndex, parsed.totalSteps);
            } else if (parsed.type === 'skillMd' && onSkillMd) {
              onSkillMd(parsed.chunk, parsed.fullContent);
            } else if (parsed.type === 'error') {
              throw new Error(parsed.message || 'Generation failed');
            } else {
              onProgress(parsed as StreamProgress);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  throw new Error('Stream ended without complete result');
}

export async function regenerateSkill(creationId: string, feedback: string): Promise<GenerateResponse> {
  const response = await fetchApi<ApiResponse<GenerateResponse>>(`/composer/${creationId}/regenerate`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
  });
  if (!response.data) throw new Error(response.error || 'Failed to regenerate skill');
  return response.data;
}

export async function saveSkillDraft(creationId: string, skillMd: string): Promise<boolean> {
  const response = await fetchApi<ApiResponse<{ saved: boolean }>>(`/composer/${creationId}`, {
    method: 'PUT',
    body: JSON.stringify({ skillMd }),
  });
  return response.data?.saved || false;
}

export async function publishSkill(creationId: string, name: string, description: string, visibility: 'public' | 'private' = 'public'): Promise<{ skillId: string; url: string }> {
  const response = await fetchApi<ApiResponse<{ skillId: string; url: string }>>(`/composer/${creationId}/publish`, {
    method: 'POST',
    body: JSON.stringify({ name, description, visibility }),
  });
  if (!response.data) throw new Error(response.error || 'Failed to publish skill');
  return response.data;
}

export async function getSkillDrafts(): Promise<DraftItem[]> {
  const response = await fetchApi<ApiResponse<DraftItem[]>>('/composer/drafts');
  return response.data || [];
}

export async function getSkillCreation(creationId: string): Promise<GenerateResponse> {
  const response = await fetchApi<ApiResponse<GenerateResponse>>(`/composer/${creationId}`);
  if (!response.data) throw new Error(response.error || 'Creation not found');
  return response.data;
}

// ─── Converter Types & API ─────────────────────────────────────────────────

export interface ValidationCheck {
  field: string;
  passed: boolean;
  message: string;
  autoFixed: boolean;
}

export interface ConversionResult {
  skillMd: string;
  resources: { path: string; content: string; description: string }[];
  validation: {
    score: number;
    checks: ValidationCheck[];
  };
  original: {
    source: 'paste' | 'github' | 'marketplace' | 'composer';
    name?: string;
  };
}

export interface GithubPickResult {
  files: string[];
  needsPick: boolean;
}

export async function convertPaste(
  content: string,
  filename?: string,
  resources?: { path: string; content: string; description: string }[]
): Promise<ConversionResult> {
  const response = await fetchApi<ApiResponse<ConversionResult>>('/converter/paste', {
    method: 'POST',
    body: JSON.stringify({ content, filename, resources }),
  });
  if (!response.data) throw new Error(response.error || 'Conversion failed');
  return response.data;
}

export async function convertGithub(url: string, subpath?: string): Promise<ConversionResult | GithubPickResult> {
  const response = await fetchApi<ApiResponse<ConversionResult | GithubPickResult>>('/converter/github', {
    method: 'POST',
    body: JSON.stringify({ url, subpath }),
  });
  if (!response.data) throw new Error(response.error || 'GitHub import failed');
  return response.data;
}

export async function convertGithubPick(url: string, file: string): Promise<ConversionResult> {
  const response = await fetchApi<ApiResponse<ConversionResult>>('/converter/github/pick', {
    method: 'POST',
    body: JSON.stringify({ url, file }),
  });
  if (!response.data) throw new Error(response.error || 'GitHub import failed');
  return response.data;
}

export async function convertSkill(skillId: string): Promise<ConversionResult> {
  const response = await fetchApi<ApiResponse<ConversionResult>>(`/converter/skill/${skillId}`);
  if (!response.data) throw new Error(response.error || 'Conversion failed');
  return response.data;
}

export async function publishConverted(
  content: string,
  resources: { path: string; content: string; description: string }[],
  visibility: 'public' | 'private'
): Promise<{ skillId: string; url: string }> {
  const response = await fetchApi<ApiResponse<{ skillId: string; url: string }>>('/converter/publish', {
    method: 'POST',
    body: JSON.stringify({ content, resources, visibility }),
  });
  if (!response.data) throw new Error(response.error || 'Publish failed');
  return response.data;
}
