/**
 * Apify Baseline v1 - IMMUTABLE
 *
 * Cities scraped prior to Outscraper ingestion.
 * This is the historical source of truth.
 *
 * RULES:
 * - This file is APPEND-ONLY (for future baselines)
 * - Never auto-generate or modify
 * - Any future baseline = apify-v2-cities.ts, etc.
 *
 * Created: 2026-01-14
 * Source: Original Apify scrape configuration
 */

/**
 * 35 cities scraped via Apify (pre-Outscraper era)
 * DO NOT EDIT - This is historical truth
 */
export const APIFY_V1_CITIES = [
  "Atlanta, GA",
  "Austin, TX",
  "Baltimore, MD",
  "Boston, MA",
  "Charlotte, NC",
  "Chicago, IL",
  "Columbus, OH",
  "Dallas, TX",
  "Denver, CO",
  "Detroit, MI",
  "Houston, TX",
  "Indianapolis, IN",
  "Jacksonville, FL",
  "Kansas City, MO",
  "Las Vegas, NV",
  "Los Angeles, CA",
  "Louisville, KY",
  "Miami, FL",
  "Milwaukee, WI",
  "Minneapolis, MN",
  "Nashville, TN",
  "New York, NY",
  "Oklahoma City, OK",
  "Orlando, FL",
  "Philadelphia, PA",
  "Phoenix, AZ",
  "Portland, OR",
  "Raleigh, NC",
  "Sacramento, CA",
  "Salt Lake City, UT",
  "San Antonio, TX",
  "San Francisco, CA",
  "Seattle, WA",
  "St. Louis, MO",
  "Tampa, FL",
] as const;

/**
 * Type for baseline city validation
 */
export type ApifyV1City = (typeof APIFY_V1_CITIES)[number];

/**
 * Count for verification
 */
export const APIFY_V1_COUNT = APIFY_V1_CITIES.length; // 35
