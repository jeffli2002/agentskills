export const API_BASE = '/api';
async function fetchApi(path, options) {
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
export async function getCurrentUser() {
    const response = await fetchApi('/auth/me');
    return response.data;
}
export async function logout() {
    await fetchApi('/auth/logout', { method: 'POST' });
}
// Skills
export async function getSkills(params) {
    const searchParams = new URLSearchParams();
    if (params?.q)
        searchParams.set('q', params.q);
    if (params?.category)
        searchParams.set('category', params.category);
    if (params?.sort)
        searchParams.set('sort', params.sort);
    if (params?.limit)
        searchParams.set('limit', params.limit.toString());
    if (params?.offset)
        searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return fetchApi(`/skills${query ? `?${query}` : ''}`);
}
export async function getSkill(id) {
    const response = await fetchApi(`/skills/${id}`);
    return response.data;
}
export async function getCategories() {
    const response = await fetchApi('/categories');
    return response.data || [];
}
export async function getCategoriesWithCounts() {
    const response = await fetchApi('/skills/meta/categories');
    return response.data || [];
}
export function getDownloadUrl(skillId) {
    return `${API_BASE}/skills/${skillId}/download`;
}
// OpenClaw Export
export function getOpenClawExportUrl(skillId) {
    return `${API_BASE}/skills/${skillId}/export/openclaw`;
}
export async function getOpenClawExport(skillId) {
    const res = await fetch(getOpenClawExportUrl(skillId), { credentials: 'include' });
    if (!res.ok)
        throw new Error('Export failed');
    const content = await res.text();
    const name = res.headers.get('X-OpenClaw-Name') || 'skill';
    return { content, name };
}
// My Skills (user's created skills)
export async function getMySkills() {
    const response = await fetchApi('/skills/my');
    return response.data || [];
}
// Favorites
export async function getFavorites() {
    const response = await fetchApi('/favorites');
    return response.data || [];
}
export async function addFavorite(skillId) {
    const response = await fetchApi(`/favorites/${skillId}`, {
        method: 'POST',
    });
    return response.data?.favorited || false;
}
export async function removeFavorite(skillId) {
    const response = await fetchApi(`/favorites/${skillId}`, {
        method: 'DELETE',
    });
    return !response.data?.favorited;
}
// Ratings
export async function rateSkill(skillId, score) {
    const response = await fetchApi(`/ratings/${skillId}`, {
        method: 'POST',
        body: JSON.stringify({ score }),
    });
    return { avgRating: response.data?.avgRating || 0, ratingCount: response.data?.ratingCount || 0 };
}
// Related Skills
export async function getRelatedSkills(skillId, category) {
    const response = await fetchApi(`/skills/${skillId}/related`);
    return response.data || [];
}
// Parse skill files from JSON
export function parseSkillFiles(filesJson) {
    if (!filesJson)
        return [];
    try {
        return JSON.parse(filesJson);
    }
    catch {
        return [];
    }
}
// Parse skill metadata from JSON
export function parseSkillMetadata(metadataJson) {
    if (!metadataJson)
        return null;
    try {
        return JSON.parse(metadataJson);
    }
    catch {
        return null;
    }
}
// Skill Composer API
export async function clarifyRequirements(prompt, conversationHistory = []) {
    const response = await fetchApi('/composer/clarify', {
        method: 'POST',
        body: JSON.stringify({ prompt, conversationHistory }),
    });
    if (!response.data)
        throw new Error(response.error || 'Failed to clarify requirements');
    return response.data;
}
export async function generateSkill(prompt, category) {
    const response = await fetchApi('/composer/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, category }),
    });
    if (!response.data)
        throw new Error(response.error || 'Failed to generate skill');
    return response.data;
}
export async function generateSkillStreaming(prompt, category, onProgress, onStep, onSkillMd) {
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
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const data = line.slice(5).trim();
                    if (!data)
                        continue;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.type === 'complete') {
                            return parsed.result;
                        }
                        else if (parsed.type === 'step' && onStep) {
                            onStep(parsed.step, parsed.stepIndex, parsed.totalSteps);
                        }
                        else if (parsed.type === 'skillMd' && onSkillMd) {
                            onSkillMd(parsed.chunk, parsed.fullContent);
                        }
                        else if (parsed.type === 'error') {
                            throw new Error(parsed.message || 'Generation failed');
                        }
                        else {
                            onProgress(parsed);
                        }
                    }
                    catch (e) {
                        if (e instanceof SyntaxError)
                            continue;
                        throw e;
                    }
                }
            }
        }
    }
    finally {
        reader.releaseLock();
    }
    throw new Error('Stream ended without complete result');
}
export async function regenerateSkill(creationId, feedback) {
    const response = await fetchApi(`/composer/${creationId}/regenerate`, {
        method: 'POST',
        body: JSON.stringify({ feedback }),
    });
    if (!response.data)
        throw new Error(response.error || 'Failed to regenerate skill');
    return response.data;
}
export async function saveSkillDraft(creationId, skillMd) {
    const response = await fetchApi(`/composer/${creationId}`, {
        method: 'PUT',
        body: JSON.stringify({ skillMd }),
    });
    return response.data?.saved || false;
}
export async function publishSkill(creationId, name, description, visibility = 'public') {
    const response = await fetchApi(`/composer/${creationId}/publish`, {
        method: 'POST',
        body: JSON.stringify({ name, description, visibility }),
    });
    if (!response.data)
        throw new Error(response.error || 'Failed to publish skill');
    return response.data;
}
export async function getSkillDrafts() {
    const response = await fetchApi('/composer/drafts');
    return response.data || [];
}
export async function getSkillCreation(creationId) {
    const response = await fetchApi(`/composer/${creationId}`);
    if (!response.data)
        throw new Error(response.error || 'Creation not found');
    return response.data;
}
export async function convertPaste(content, filename, resources) {
    const response = await fetchApi('/converter/paste', {
        method: 'POST',
        body: JSON.stringify({ content, filename, resources }),
    });
    if (!response.data)
        throw new Error(response.error || 'Conversion failed');
    return response.data;
}
export async function convertGithub(url, subpath) {
    const response = await fetchApi('/converter/github', {
        method: 'POST',
        body: JSON.stringify({ url, subpath }),
    });
    if (!response.data)
        throw new Error(response.error || 'GitHub import failed');
    return response.data;
}
export async function convertGithubPick(url, file) {
    const response = await fetchApi('/converter/github/pick', {
        method: 'POST',
        body: JSON.stringify({ url, file }),
    });
    if (!response.data)
        throw new Error(response.error || 'GitHub import failed');
    return response.data;
}
export async function convertSkill(skillId) {
    const response = await fetchApi(`/converter/skill/${skillId}`);
    if (!response.data)
        throw new Error(response.error || 'Conversion failed');
    return response.data;
}
export async function publishConverted(content, resources, visibility) {
    const response = await fetchApi('/converter/publish', {
        method: 'POST',
        body: JSON.stringify({ content, resources, visibility }),
    });
    if (!response.data)
        throw new Error(response.error || 'Publish failed');
    return response.data;
}
