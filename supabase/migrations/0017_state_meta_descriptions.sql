-- Add meta_description column to states table for unique SEO descriptions
ALTER TABLE states ADD COLUMN meta_description TEXT DEFAULT NULL;
