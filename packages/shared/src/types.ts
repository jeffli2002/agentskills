// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

// Skill file structure for file explorer
export interface SkillFile {
  path: string;
  name: string;
  size: number;
  type: 'file' | 'folder';
}

// Skill types
export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatarUrl: string | null;
  githubUrl: string;
  starsCount: number;
  forksCount: number;
  category: string;
  r2FileKey: string;
  fileSize: number;
  downloadCount: number;
  avgRating: number;
  ratingCount: number;
  lastCommitAt: number | null;
  filesJson: string | null;
  skillMdContent: string | null;
  skillMdParsed: string | null;
  createdAt: number;
  updatedAt: number;
}

// Extended skill detail with parsed data
export interface SkillDetail extends Skill {
  files: SkillFile[];
  parsedMetadata: Record<string, string> | null;
}

// Related skill for sidebar display
export interface RelatedSkill {
  id: string;
  name: string;
  author: string;
  authorAvatarUrl: string | null;
  starsCount: number;
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
