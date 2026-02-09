-- Add resources_json column to skills table for multi-file skill support
ALTER TABLE skills ADD COLUMN resources_json TEXT;
