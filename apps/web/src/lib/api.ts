import type { ApiResponse, PaginatedResponse, Skill, SkillsQueryParams, User, RelatedSkill, SkillFile } from '@agentskills/shared';

const API_BASE = '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
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
