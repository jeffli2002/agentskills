import { Hono } from 'hono';
import { eq, sql, gte, desc } from 'drizzle-orm';
import { createDb, skills, users } from '../db';

type Bindings = {
  DB: D1Database;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
};

type Variables = {
  admin?: boolean;
};

const adminRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 简单验证中间件
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = atob(token);
    if (!decoded.includes(':admin')) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    c.set('admin', true);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// 登录
adminRouter.post('/login', async (c) => {
  const { password } = await c.req.json();
  const ADMIN_PASSWORD = c.env.ADMIN_PASSWORD || 'admin123';
  
  if (password !== ADMIN_PASSWORD) {
    return c.json({ error: 'Invalid password' }, 401);
  }
  
  const token = btoa(`${Date.now()}:admin`);
  
  return c.json({ token, expiresIn: 86400 });
});

// 仪表盘数据
adminRouter.get('/dashboard', requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 今日新增Skills
  const newSkillsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(skills)
    .where(gte(skills.createdAt, today));
  
  // 今日新增用户
  const newUsersResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, today));
  
  // Skills趋势（过去7天）
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const skillsTrend = await db
    .select({
      date: sql<string>`date(${skills.createdAt} / 1000, 'unixepoch')`.as('date'),
      count: sql<number>`count(*)`.as('count'),
    })
    .from(skills)
    .where(gte(skills.createdAt, sevenDaysAgo))
    .groupBy(sql`date(${skills.createdAt} / 1000, 'unixepoch')`)
    .orderBy(sql`date(${skills.createdAt} / 1000, 'unixepoch')`);
  
  // 用户趋势（过去7天）
  const usersTrend = await db
    .select({
      date: sql<string>`date(${users.createdAt} / 1000, 'unixepoch')`.as('date'),
      count: sql<number>`count(*)`.as('count'),
    })
    .from(users)
    .where(gte(users.createdAt, sevenDaysAgo))
    .groupBy(sql`date(${users.createdAt} / 1000, 'unixepoch')`)
    .orderBy(sql`date(${users.createdAt} / 1000, 'unixepoch')`);
  
  // 总计
  const totalSkills = await db.select({ count: sql<number>`count(*)` }).from(skills);
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  
  return c.json({
    today: {
      newSkills: newSkillsResult[0]?.count || 0,
      newUsers: newUsersResult[0]?.count || 0,
    },
    total: {
      skills: totalSkills[0]?.count || 0,
      users: totalUsers[0]?.count || 0,
    },
    trend: {
      skills: skillsTrend,
      users: usersTrend,
    },
  });
});

// Skills列表
adminRouter.get('/skills', requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;
  
  const skillsList = await db
    .select()
    .from(skills)
    .orderBy(desc(skills.createdAt))
    .limit(limit)
    .offset(offset);
  
  const total = await db.select({ count: sql<number>`count(*)` }).from(skills);
  
  return c.json({
    data: skillsList,
    pagination: {
      page,
      limit,
      total: total[0]?.count || 0,
    },
  });
});

// 删除Skill
adminRouter.delete('/skills/:id', requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');
  
  await db.delete(skills).where(eq(skills.id, id));
  
  return c.json({ success: true });
});

// 用户列表
adminRouter.get('/users', requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;
  
  const usersList = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
  
  const total = await db.select({ count: sql<number>`count(*)` }).from(users);
  
  return c.json({
    data: usersList,
    pagination: {
      page,
      limit,
      total: total[0]?.count || 0,
    },
  });
});

// 删除/禁用用户
adminRouter.delete('/users/:id', requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');
  
  await db.delete(users).where(eq(users.id, id));
  
  return c.json({ success: true });
});

export { adminRouter };
export default adminRouter;
