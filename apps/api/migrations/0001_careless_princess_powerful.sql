ALTER TABLE `skills` ADD `author_avatar_url` text;--> statement-breakpoint
ALTER TABLE `skills` ADD `forks_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `last_commit_at` integer;--> statement-breakpoint
ALTER TABLE `skills` ADD `files_json` text;--> statement-breakpoint
ALTER TABLE `skills` ADD `skill_md_content` text;--> statement-breakpoint
ALTER TABLE `skills` ADD `skill_md_parsed` text;