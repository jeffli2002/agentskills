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
  const host = c.req.header('host') || 'localhost:8787';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/api/auth/callback`;
}

function getFrontendUrl(c: any): string {
  const host = c.req.header('host') || 'localhost:8787';
  if (host.includes('localhost')) {
    return 'http://localhost:5173';
  }
  return 'https://agentskills.pages.dev';
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

  if (error || !code) {
    return c.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
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

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return c.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json() as { access_token: string };

    // Fetch user info
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return c.redirect(`${frontendUrl}/login?error=userinfo_failed`);
    }

    const googleUser = await userInfoResponse.json() as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    const db = createDb(c.env.DB);

    // Upsert user
    let user = await db.select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .get();

    const now = Date.now();

    if (!user) {
      user = {
        id: generateId(),
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
      await db.insert(users).values(user);
    } else {
      await db.update(users)
        .set({
          name: googleUser.name,
          avatarUrl: googleUser.picture,
          updatedAt: new Date(now),
        })
        .where(eq(users.id, user.id));
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = createSessionExpiry();

    await db.insert(sessions).values({
      id: sessionToken,
      userId: user.id,
      expiresAt,
      createdAt: new Date(now),
    });

    // Set session cookie
    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: !c.req.header('host')?.includes('localhost'),
      sameSite: 'Lax',
      path: '/',
      expires: expiresAt,
    });

    return c.redirect(frontendUrl);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return c.redirect(`${frontendUrl}/login?error=unknown`);
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
