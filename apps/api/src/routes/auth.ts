import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { createDb, users, sessions } from '../db';
import { generateId, generateSessionToken, createSessionExpiry } from '../lib/utils';
import type { ApiResponse, User } from '@agentskills/shared';

type Bindings = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  ENVIRONMENT: string;
};

type Variables = {
  user?: User;
};

const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

function getRedirectUri(c: any): string {
  // Use X-Forwarded-Host if behind a proxy (e.g., Cloudflare Pages)
  const forwardedHost = c.req.header('x-forwarded-host');
  const host = forwardedHost || c.req.header('host') || 'localhost:8788';

  // In dev mode, API runs on 8788 but frontend runs on 5180
  // Google OAuth needs the frontend URL since that's what user sees
  if (host.includes('localhost:8788') || host.includes('localhost:8787')) {
    return 'http://localhost:5180/api/auth/callback';
  }
  const forwardedProto = c.req.header('x-forwarded-proto');
  const protocol = forwardedProto || (host.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}/api/auth/callback`;
}

function getFrontendUrl(c: any): string {
  // Use X-Forwarded-Host if behind a proxy (e.g., Cloudflare Pages)
  const forwardedHost = c.req.header('x-forwarded-host');
  const host = forwardedHost || c.req.header('host') || 'localhost:8787';

  if (host.includes('localhost')) {
    return 'http://localhost:5180';
  }
  // Preserve www subdomain if present
  if (host.includes('www.agentskills.cv')) {
    return 'https://www.agentskills.cv';
  }
  return 'https://agentskills.cv';
}

// Initiate Google OAuth
authRouter.get('/google', async (c) => {
  const redirectUri = getRedirectUri(c);

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return c.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

// Google OAuth callback
authRouter.get('/callback', async (c) => {
  const code = c.req.query('code');
  const error = c.req.query('error');
  const frontendUrl = getFrontendUrl(c);
  const testMode = c.req.query('test') === '1';

  if (error || !code) {
    return c.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }

  try {
    let googleUser: { id: string; email: string; name: string; picture: string };

    if (testMode) {
      // Test mode - skip Google API calls
      googleUser = {
        id: 'test-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
      };
    } else {
      // Exchange code for tokens
      let tokenResponse;
      try {
        console.log('Fetching token from Google...');
        tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: c.env.GOOGLE_CLIENT_ID,
            client_secret: c.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: getRedirectUri(c),
          }),
        });
        console.log('Token response status:', tokenResponse.status);
      } catch (fetchErr) {
        console.error('Token fetch error:', fetchErr);
        return c.redirect(`${frontendUrl}/login?error=token_fetch_error`);
      }

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        return c.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
      }

      const tokens = await tokenResponse.json() as { access_token: string };
      console.log('Got access token');

      // Fetch user info
      let userInfoResponse;
      try {
        console.log('Fetching user info from Google...');
        userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        console.log('User info response status:', userInfoResponse.status);
      } catch (userFetchErr) {
        console.error('User info fetch error:', userFetchErr);
        return c.redirect(`${frontendUrl}/login?error=userinfo_fetch_error`);
      }

      if (!userInfoResponse.ok) {
        return c.redirect(`${frontendUrl}/login?error=userinfo_failed`);
      }

      googleUser = await userInfoResponse.json() as {
        id: string;
        email: string;
        name: string;
        picture: string;
      };
    }

    // Use raw D1 SQL to bypass Drizzle ORM issues
    const d1 = c.env.DB;

    console.log('=== OAuth callback debug ===');
    console.log('Google user:', JSON.stringify(googleUser));

    // Test D1 connection first
    try {
      const testResult = await d1.prepare('SELECT 1 as test').first();
      console.log('D1 connection test:', testResult);
    } catch (testErr) {
      console.error('D1 connection test FAILED:', testErr);
      throw new Error('D1 connection failed');
    }

    // Check if users table exists
    try {
      const tableCheck = await d1.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      ).first();
      console.log('Users table exists:', tableCheck);
    } catch (tableErr) {
      console.error('Table check FAILED:', tableErr);
      throw new Error('Table check failed');
    }

    // Upsert user using raw SQL
    let existingUser;
    try {
      existingUser = await d1.prepare(
        'SELECT id, email, name, avatar_url, created_at, updated_at FROM users WHERE email = ?'
      ).bind(googleUser.email).first();
      console.log('Existing user lookup result:', existingUser);
    } catch (selectErr) {
      console.error('User SELECT failed:', selectErr);
      throw new Error('User select failed: ' + (selectErr instanceof Error ? selectErr.message : 'unknown'));
    }

    const now = Date.now();
    let userId: string;

    if (!existingUser) {
      const newUserId = generateId();
      console.log('Creating new user with id:', newUserId, 'email:', googleUser.email);

      try {
        const insertResult = await d1.prepare(
          'INSERT INTO users (id, email, name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(newUserId, googleUser.email, googleUser.name, googleUser.picture, now, now).run();
        console.log('User INSERT result:', JSON.stringify(insertResult));
      } catch (insertErr) {
        console.error('User INSERT failed:', insertErr);
        throw new Error('User insert failed: ' + (insertErr instanceof Error ? insertErr.message : 'unknown'));
      }

      userId = newUserId;
    } else {
      console.log('Updating existing user:', existingUser.id);
      try {
        const updateResult = await d1.prepare(
          'UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?'
        ).bind(googleUser.name, googleUser.picture, now, existingUser.id).run();
        console.log('User UPDATE result:', JSON.stringify(updateResult));
      } catch (updateErr) {
        console.error('User UPDATE failed:', updateErr);
        throw new Error('User update failed: ' + (updateErr instanceof Error ? updateErr.message : 'unknown'));
      }

      userId = existingUser.id as string;
    }

    // Create session using raw SQL
    const sessionToken = generateSessionToken();
    const expiresAt = createSessionExpiry();

    console.log('Creating session for user:', userId, 'expires:', expiresAt.getTime());
    try {
      const sessionResult = await d1.prepare(
        'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
      ).bind(sessionToken, userId, expiresAt.getTime(), now).run();
      console.log('Session INSERT result:', JSON.stringify(sessionResult));
    } catch (sessionErr) {
      console.error('Session INSERT failed:', sessionErr);
      throw new Error('Session insert failed: ' + (sessionErr instanceof Error ? sessionErr.message : 'unknown'));
    }

    // Fetch user for cookie and response
    const user = await d1.prepare(
      'SELECT id, email, name, avatar_url, created_at, updated_at FROM users WHERE id = ?'
    ).bind(userId).first();
    console.log('Final user fetch:', user);

    // Set session cookie
    // For cross-domain cookies: sameSite=None requires secure=true
    const isLocalhost = c.req.header('host')?.includes('localhost');
    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'Lax' : 'None',
      path: '/',
      expires: expiresAt,
    });

    return c.redirect(frontendUrl);
  } catch (err) {
    console.error('OAuth callback error:', err);
    const errorMessage = err instanceof Error ? err.message : 'unknown';
    return c.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`);
  }
});

// Get current user
authRouter.get('/me', async (c) => {
  const sessionToken = getCookie(c, 'session');

  if (!sessionToken) {
    return c.json<ApiResponse<null>>({ data: null, error: null });
  }

  const db = createDb(c.env.DB);

  const session = await db.select()
    .from(sessions)
    .where(eq(sessions.id, sessionToken))
    .get();

  if (!session || session.expiresAt < new Date()) {
    deleteCookie(c, 'session');
    return c.json<ApiResponse<null>>({ data: null, error: null });
  }

  const user = await db.select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user) {
    deleteCookie(c, 'session');
    return c.json<ApiResponse<null>>({ data: null, error: null });
  }

  // Convert Date objects to timestamps for API response
  const userData: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.getTime(),
    updatedAt: user.updatedAt.getTime(),
  };

  return c.json<ApiResponse<User>>({ data: userData, error: null });
});

// Logout
authRouter.post('/logout', async (c) => {
  const sessionToken = getCookie(c, 'session');

  if (sessionToken) {
    const db = createDb(c.env.DB);
    await db.delete(sessions).where(eq(sessions.id, sessionToken));
    deleteCookie(c, 'session');
  }

  return c.json<ApiResponse<{ success: boolean }>>({ data: { success: true }, error: null });
});

export { authRouter };
