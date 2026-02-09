// API client: fetch skills from agentskills.cv

const API_BASE = process.env.AGENTSKILLS_API || 'https://agentskills.cv/api';

export interface SkillResult {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  starsCount: number;
  downloadCount: number;
  skillMdContent: string | null;
  skillMdParsed: string | null;
}

export interface SearchResult {
  data: SkillResult[];
  total: number;
  limit: number;
  offset: number;
}

export async function searchSkills(query: string, limit = 10): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query, limit: limit.toString() });
  const res = await fetch(`${API_BASE}/skills?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<SearchResult>;
}

export async function getSkillById(id: string): Promise<SkillResult | null> {
  const res = await fetch(`${API_BASE}/skills/${id}`);
  if (!res.ok) return null;
  const json = await res.json() as { data: SkillResult | null };
  return json.data;
}

export async function getSkillByName(name: string): Promise<SkillResult | null> {
  // Search by exact name
  const params = new URLSearchParams({ q: name, limit: '20' });
  const res = await fetch(`${API_BASE}/skills?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json() as SearchResult;

  // Find exact match (case-insensitive)
  const lower = name.toLowerCase();
  return json.data.find(s => s.name.toLowerCase() === lower) || json.data[0] || null;
}

export async function fetchOpenClawExport(skillId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/skills/${skillId}/export/openclaw`);
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.text();
}
