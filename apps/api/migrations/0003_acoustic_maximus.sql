ALTER TABLE `skills` ADD `creator_id` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `skills` ADD `visibility` text DEFAULT 'public' NOT NULL;