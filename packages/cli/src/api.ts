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

export interface ExportResult {
  skillMd: string;
  resources: { path: string; content: string }[];
}

// Parse a stored (uncompressed) ZIP buffer to extract files
function parseZipFiles(buffer: ArrayBuffer): { path: string; content: string }[] {
  const view = new DataView(buffer);
  const files: { path: string; content: string }[] = [];
  let offset = 0;
  const decoder = new TextDecoder();

  while (offset < buffer.byteLength - 4) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break; // Not a local file header

    const compressedSize = view.getUint32(offset + 18, true);
    const filenameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    const filenameBytes = new Uint8Array(buffer, offset + 30, filenameLen);
    const path = decoder.decode(filenameBytes);

    const contentStart = offset + 30 + filenameLen + extraLen;
    const contentBytes = new Uint8Array(buffer, contentStart, compressedSize);
    const content = decoder.decode(contentBytes);

    files.push({ path, content });
    offset = contentStart + compressedSize;
  }

  return files;
}

export async function fetchOpenClawExport(skillId: string): Promise<ExportResult> {
  const res = await fetch(`${API_BASE}/skills/${skillId}/export/openclaw`);
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);

  const contentType = res.headers.get('content-type') || '';

  // Multi-file: ZIP response
  if (contentType.includes('application/zip')) {
    const buffer = await res.arrayBuffer();
    const files = parseZipFiles(buffer);

    const skillMdFile = files.find(f => f.path === 'SKILL.md');
    const resources = files.filter(f => f.path !== 'SKILL.md');

    return {
      skillMd: skillMdFile?.content || '',
      resources,
    };
  }

  // Single-file: plain markdown
  const skillMd = await res.text();
  return { skillMd, resources: [] };
}
