/**
 * Ingestion Boundary - SINGLE ENTRY POINT
 *
 * ALL directory data (stores, cities) must enter through this module.
 * Gate 16 enforces this at build time.
 *
 * Sources are isolated in separate files.
 * This file owns: logging, validation, city creation, exports.
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. All store inserts go through this module
 * 2. All city inserts go through this module
 * 3. Every operation is logged to ingestion_log
 * 4. All ingested stores get is_verified = true
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { City, CityRow, CityInsert } from '@/lib/types'

// =============================================================================
// Types
// =============================================================================

export type IngestionOperation = 'apify_import' | 'submission_approved'

export interface IngestionLogEntry {
  operation: IngestionOperation
  source: string
  recordsAffected: number
  initiatedBy: string
}

// =============================================================================
// Row to Model Transformer (same as queries.ts)
// =============================================================================

function cityRowToModel(row: CityRow): City {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    stateId: row.state_id,
    stateCode: row.state_code,
    lat: row.lat,
    lng: row.lng,
    storeCount: row.store_count,
  }
}

// =============================================================================
// Logging
// =============================================================================

/**
 * Log every ingestion operation to ingestion_log table
 * This provides an audit trail for all data entering the system.
 */
export async function logIngestion(
  operation: IngestionOperation,
  source: string,
  recordsAffected: number,
  initiatedBy: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('ingestion_log')
    .insert({
      operation,
      source,
      records_affected: recordsAffected,
      initiated_by: initiatedBy,
    })

  if (error) {
    // Log error but don't fail the operation
    // Ingestion logging is important but not critical path
    console.error('Failed to log ingestion:', error)
  }
}

// =============================================================================
// City Creation (Shared Helper)
// =============================================================================

/**
 * Get a city by name and state ID
 */
async function getCityByNameAndState(
  cityName: string,
  stateId: number
): Promise<City | null> {
  const { data, error } = await supabaseAdmin
    .from('cities')
    .select('*')
    .eq('state_id', stateId)
    .ilike('name', cityName)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return cityRowToModel(data)
}

/**
 * Create a new city
 * INTERNAL: Only called from ensureCity
 */
async function createCity(city: CityInsert): Promise<City> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('cities')
    .insert(city)
    .select()
    .single()

  if (error) throw error
  return cityRowToModel(data as CityRow)
}

/**
 * Ensure a city exists, creating it if needed
 * This is the ONLY way to create cities in the system.
 * Used by all ingestion sources.
 */
export async function ensureCity(
  stateId: number,
  stateCode: string,
  cityName: string,
  lat?: number | null,
  lng?: number | null
): Promise<City> {
  // Try to find existing city by name and state
  const existing = await getCityByNameAndState(cityName, stateId)
  if (existing) {
    return existing
  }

  // Create new city with deterministic slug
  const slug = cityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const newCity: CityInsert = {
    slug,
    name: cityName,
    state_id: stateId,
    state_code: stateCode.toLowerCase(),
    lat: lat ?? null,
    lng: lng ?? null,
  }

  return createCity(newCity)
}

// =============================================================================
// Re-exports (Source Functions)
// =============================================================================

export { ingestStoresFromApify } from './apify'
export type { ApifyPlace, ApifyImportResult } from './apify'
export { ingestStoreFromSubmission } from './submissions'
