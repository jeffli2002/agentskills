export function generateId(): string {
  return crypto.randomUUID();
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// 7 days in milliseconds
export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export function createSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DURATION);
}
