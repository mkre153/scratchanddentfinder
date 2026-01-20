-- Migration: Add geolocation fields to store_submissions and stores
-- Phase 1: Data Integrity - Extract & Persist Coordinates
--
-- Adds lat/lng coordinates plus metadata fields (geo_source, geo_precision)
-- for auditability. Coordinates come from Google Places Autocomplete.

-- Add coordinate fields to store_submissions table
ALTER TABLE store_submissions
ADD COLUMN lat DECIMAL(10, 7),
ADD COLUMN lng DECIMAL(10, 7),
ADD COLUMN geo_source VARCHAR(20),    -- 'places' | 'zip' | 'browser' | 'import'
ADD COLUMN geo_precision VARCHAR(20); -- 'rooftop' | 'centroid' | 'approximate'

-- Add geo metadata fields to stores table (coordinates already exist)
ALTER TABLE stores
ADD COLUMN geo_source VARCHAR(20),
ADD COLUMN geo_precision VARCHAR(20);

-- Index for coordinate queries on submissions (partial - only where coords exist)
CREATE INDEX idx_store_submissions_coords
ON store_submissions(lat, lng)
WHERE lat IS NOT NULL AND lng IS NOT NULL;

COMMENT ON COLUMN store_submissions.lat IS 'Latitude from Google Places geometry.location';
COMMENT ON COLUMN store_submissions.lng IS 'Longitude from Google Places geometry.location';
COMMENT ON COLUMN store_submissions.geo_source IS 'Source of coordinates: places, zip, browser, import';
COMMENT ON COLUMN store_submissions.geo_precision IS 'Accuracy level: rooftop, centroid, approximate';
COMMENT ON COLUMN stores.geo_source IS 'Source of coordinates: places, zip, browser, import';
COMMENT ON COLUMN stores.geo_precision IS 'Accuracy level: rooftop, centroid, approximate';
