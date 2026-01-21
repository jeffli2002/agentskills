// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

// Skill types
export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  githubUrl: string;
  starsCount: number;
  category: string;
  r2FileKey: string;
  fileSize: number;
  downloadCount: number;
  avgRating: number;
  ratingCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface SkillWithUserData extends Skill {
  isFavorited?: boolean;
  userRating?: number;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Request types
export interface SkillsQueryParams {
  q?: string;
  category?: string;
  sort?: 'stars' | 'rating' | 'downloads';
  limit?: number;
  offset?: number;
}

export interface RatingRequest {
  score: number; // 1-5
}

// Categories
export const SKILL_CATEGORIES = [
  'coding',
  'data',
  'writing',
  'automation',
  'research',
  'devops',
  'testing',
  'other'
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];
