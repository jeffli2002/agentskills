import type { ApiResponse, PaginatedResponse, Skill, SkillsQueryParams, User } from '@agentskills/shared';

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
