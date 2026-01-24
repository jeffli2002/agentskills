import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  author: text('author').notNull(),
  authorAvatarUrl: text('author_avatar_url'),
  githubUrl: text('github_url').notNull().unique(),
  starsCount: integer('stars_count').notNull().default(0),
  forksCount: integer('forks_count').notNull().default(0),
  category: text('category').notNull(),
  r2FileKey: text('r2_file_key').notNull(),
  fileSize: integer('file_size').notNull(),
  downloadCount: integer('download_count').notNull().default(0),
  avgRating: real('avg_rating').notNull().default(0),
  ratingCount: integer('rating_count').notNull().default(0),
  lastCommitAt: integer('last_commit_at', { mode: 'timestamp_ms' }),
  filesJson: text('files_json'), // JSON array of {path, name, size, type} for file tree
  skillMdContent: text('skill_md_content'), // Raw SKILL.md content
  skillMdParsed: text('skill_md_parsed'), // Parsed frontmatter as JSON
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => ({
  userSkillUnique: unique().on(table.userId, table.skillId),
}));

export const ratings = sqliteTable('ratings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => ({
  userSkillUnique: unique().on(table.userId, table.skillId),
}));

export const downloads = sqliteTable('downloads', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  skillId: text('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
});

// Type exports for use in routes
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Download = typeof downloads.$inferSelect;
