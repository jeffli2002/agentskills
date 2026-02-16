import { Hono } from 'hono';
import { eq, sql, gte, lt, and, gte as gteSql, lt as ltSql } from 'drizzle-orm';
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
    return c.json({ success: false, error: 'Invalid password' }, 401);
  }
  
  const token = btoa(`${Date.now()}:admin`);
  
  return c.json({ success: true, data: { token, expiresIn: 86400 } });
});

// 获取时间范围
function getTimeRange(filter: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  
  switch (filter) {
    case 'today':
      return { start: today, end: tomorrow };
    case 'yesterday':
      return { start: yesterday, end: today };
    case '7days':
      return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: tomorrow };
    case '30days':
      return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: tomorrow };
    case 'custom':
      if (customStart && customEnd) {
        return { start: new Date(customStart), end: new Date(customEnd) };
      }
      return { start: today, end: tomorrow };
    default:
      return { start: today, end: tomorrow };
  }
}

// 仪表盘数据
adminRouter.get('/dashboard', requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const filter = c.req.query('filter') || 'today';
  const customStart = c.req.query('start');
  const customEnd = c.req.query('end');
  
  const { start, end } = getTimeRange(filter, customStart, customEnd);
  
  // 时间范围内的统计
  const skillsInRange = await db
    .select({ count: sql<number>`count(*)` })
    .from(skills)
    .where(and(
      gte(skills.createdAt, start),
      lt(skills.createdAt, end)
    ));
  
  const usersInRange = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(
      gte(users.createdAt, start),
      lt(users.createdAt, end)
    ));
  
  // Skills分类：有creatorId的是用户创建的，没有的是导入的
  const openclawSkills = await db
    .select({ count: sql<number>`count(*)` })
    .from(skills)
    .where(and(
      gte(skills.createdAt, start),
      lt(skills.createdAt, end),
      sql`${skills.creatorId} IS NULL`
    ));
  
  const userCreatedSkills = await db
    .select({ count: sql<number>`count(*)` })
    .from(skills)
    .where(and(
      gte(skills.createdAt, start),
      lt(skills.createdAt, end),
      sql`${skills.creatorId} IS NOT NULL`
    ));
  
  // 总计
  const totalSkills = await db.select({ count: sql<number>`count(*)` }).from(skills);
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  
  const totalOpenclawSkills = await db
    .select({ count: sql<number>`count(*)` })
    .from(skills)
    .where(sql`${skills.creatorId} IS NULL`);
  
  const totalUserCreatedSkills = await db
    .select({ count: sql<number>`count(*)` })
    .from(skills)
    .where(sql`${skills.creatorId} IS NOT NULL`);
  
  // 趋势数据（过去14天）
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const skillsTrend = await db
    .select({
      date: sql<string>`date(${skills.createdAt} / 1000, 'unixepoch')`.as('date'),
      count: sql<number>`count(*)`.as('count'),
    })
    .from(skills)
    .where(gte(skills.createdAt, fourteenDaysAgo))
    .groupBy(sql`date(${skills.createdAt} / 1000, 'unixepoch')`)
    .orderBy(sql`date(${skills.createdAt} / 1000, 'unixepoch')`);
  
  const usersTrend = await db
    .select({
      date: sql<string>`date(${users.createdAt} / 1000, 'unixepoch')`.as('date'),
      count: sql<number>`count(*)`.as('count'),
    })
    .from(users)
    .where(gte(users.createdAt, fourteenDaysAgo))
    .groupBy(sql`date(${users.createdAt} / 1000, 'unixepoch')`)
    .orderBy(sql`date(${users.createdAt} / 1000, 'unixepoch')`);
  
  return c.json({
    success: true,
    data: {
      period: {
        filter,
        start: start.toISOString(),
        end: end.toISOString(),
      },
      stats: {
        newSkills: skillsInRange[0]?.count || 0,
        newUsers: usersInRange[0]?.count || 0,
        totalSkills: totalSkills[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
      },
      breakdown: {
        openclawSkills: {
          new: openclawSkills[0]?.count || 0,
          total: totalOpenclawSkills[0]?.count || 0,
        },
        userCreatedSkills: {
          new: userCreatedSkills[0]?.count || 0,
          total: totalUserCreatedSkills[0]?.count || 0,
        },
      },
      trend: {
        skills: skillsTrend,
        users: usersTrend,
      },
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
    success: true,
    data: {
      data: skillsList,
      pagination: {
        page,
        limit,
        total: total[0]?.count || 0,
      },
    },
  });
});

// 删除Skill
adminRouter.delete('/skills/:id', requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');
  
  await db.delete(skills).where(eq(skills.id, id));
  
  return c.json({ success: true, data: null });
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
    success: true,
    data: {
      data: usersList,
      pagination: {
        page,
        limit,
        total: total[0]?.count || 0,
      },
    },
  });
});

// 删除/禁用用户
adminRouter.delete('/users/:id', requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param('id');
  
  await db.delete(users).where(eq(users.id, id));
  
  return c.json({ success: true, data: null });
});

export { adminRouter };
export default adminRouter;
