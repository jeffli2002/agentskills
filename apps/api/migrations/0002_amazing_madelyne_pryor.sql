CREATE TABLE `skill_creation_outputs` (
	`id` text PRIMARY KEY NOT NULL,
	`creation_id` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`skill_md` text NOT NULL,
	`is_edited` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`creation_id`) REFERENCES `skill_creations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill_creation_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`step_id` text NOT NULL,
	`source_skill_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`step_id`) REFERENCES `skill_creation_steps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill_creation_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`creation_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`creation_id`) REFERENCES `skill_creations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill_creations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prompt` text NOT NULL,
	`category` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`generated_at` integer,
	`published_at` integer,
	`skill_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
ALTER TABLE `skills` ADD `view_count` integer DEFAULT 0 NOT NULL;