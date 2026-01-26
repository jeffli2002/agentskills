-- Add resources_json column for multi-file skill support
ALTER TABLE skill_creation_outputs ADD COLUMN resources_json TEXT;
