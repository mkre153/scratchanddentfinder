/**
 * Type definitions for Scratch and Dent Finder
 *
 * These types match the Supabase database schema.
 * Run `npx supabase gen types typescript` to regenerate from DB.
 */

// =============================================================================
// Database Types (Supabase)
// =============================================================================

export type Database = {
  public: {
    Tables: {
      states: {
        Row: StateRow
        Insert: StateInsert
        Update: StateUpdate
      }
      cities: {
        Row: CityRow
        Insert: CityInsert
        Update: CityUpdate
      }
      stores: {
        Row: StoreRow
        Insert: StoreInsert
        Update: StoreUpdate
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      subscriptions: {
        Row: SubscriptionRow
        Insert: SubscriptionInsert
        Update: SubscriptionUpdate
      }
      leads: {
        Row: LeadRow
        Insert: LeadInsert
        Update: LeadUpdate
      }
      contact_submissions: {
        Row: ContactSubmissionRow
        Insert: ContactSubmissionInsert
        Update: ContactSubmissionUpdate
      }
      store_submissions: {
        Row: StoreSubmissionRow
        Insert: StoreSubmissionInsert
        Update: Partial<StoreSubmissionInsert>
      }
    }
  }
}

// =============================================================================
// State
// =============================================================================

export interface StateRow {
  id: number
  slug: string
  name: string
  emoji: string
  gradient_color: string
  store_count: number
  city_count: number
  created_at: string
}

export type StateInsert = Omit<StateRow, 'id' | 'created_at' | 'store_count' | 'city_count'>
export type StateUpdate = Partial<StateInsert>

export interface State {
  id: number
  slug: string
  name: string
  emoji: string
  gradientColor: string
  storeCount: number
  cityCount: number
}

// =============================================================================
// City
// =============================================================================

export interface CityRow {
  id: number
  slug: string
  name: string
  state_id: number
  state_code: string
  lat: number | null
  lng: number | null
  store_count: number
  created_at: string
}

export type CityInsert = Omit<CityRow, 'id' | 'created_at' | 'store_count'>
export type CityUpdate = Partial<CityInsert>

export interface City {
  id: number
  slug: string
  name: string
  stateId: number
  stateCode: string
  lat: number | null
  lng: number | null
  storeCount: number
}

// =============================================================================
// Store
// =============================================================================

export interface StoreHours {
  [day: string]: { open: string; close: string } | 'closed'
}

export interface StoreAppliances {
  refrigerators: boolean
  washersAndDryers: boolean
  stovesAndRanges: boolean
  dishwashers: boolean
}

export interface StoreServices {
  delivery: boolean
  installation: boolean
}

export interface StoreRow {
  id: number
  place_id: string
  user_id: string | null
  name: string
  slug: string
  address: string
  city_id: number
  state_id: number
  zip: string | null
  phone: string | null
  website: string | null
  description: string | null
  hours: StoreHours | null
  appliances: StoreAppliances | null
  services: StoreServices | null
  rating: number | null
  review_count: number | null
  is_featured: boolean
  featured_tier: 'monthly' | 'annual' | 'lifetime' | null
  featured_until: string | null
  lat: number | null
  lng: number | null
  is_approved: boolean
  created_at: string
  updated_at: string
}

export type StoreInsert = Omit<StoreRow, 'id' | 'created_at' | 'updated_at'>
export type StoreUpdate = Partial<StoreInsert>

export interface Store {
  id: number
  placeId: string
  userId: string | null
  name: string
  slug: string
  address: string
  cityId: number
  stateId: number
  zip: string | null
  phone: string | null
  website: string | null
  description: string | null
  hours: StoreHours | null
  appliances: StoreAppliances | null
  services: StoreServices | null
  rating: number | null
  reviewCount: number | null
  isFeatured: boolean
  featuredTier: 'monthly' | 'annual' | 'lifetime' | null
  featuredUntil: string | null
  lat: number | null
  lng: number | null
  isApproved: boolean
}

// =============================================================================
// Profile
// =============================================================================

export interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  is_store_owner: boolean
  created_at: string
}

export type ProfileInsert = Omit<ProfileRow, 'created_at'>
export type ProfileUpdate = Partial<ProfileInsert>

// =============================================================================
// Subscription
// =============================================================================

export interface SubscriptionRow {
  id: number
  user_id: string
  store_id: number
  stripe_customer_id: string
  stripe_subscription_id: string | null
  tier: 'monthly' | 'annual' | 'lifetime'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  current_period_end: string | null
  created_at: string
}

export type SubscriptionInsert = Omit<SubscriptionRow, 'id' | 'created_at'>
export type SubscriptionUpdate = Partial<SubscriptionInsert>

// =============================================================================
// Lead
// =============================================================================

export interface LeadRow {
  id: number
  store_id: number
  source_url: string
  source_page_type: 'city' | 'state' | null
  cta_type: 'call' | 'directions' | 'website' | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  created_at: string
}

export type LeadInsert = Omit<LeadRow, 'id' | 'created_at'>
export type LeadUpdate = Partial<LeadInsert>

// =============================================================================
// Contact Submission
// =============================================================================

export interface ContactSubmissionRow {
  id: number
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export type ContactSubmissionInsert = Omit<ContactSubmissionRow, 'id' | 'created_at' | 'is_read'>
export type ContactSubmissionUpdate = Partial<ContactSubmissionInsert>

// =============================================================================
// Store Submission (Slice 4 - Untrusted, Isolated from Directory)
// =============================================================================

export interface StoreSubmissionRow {
  id: string
  business_name: string
  street_address: string
  city: string
  state: string
  phone: string | null
  website: string | null
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
}

export type StoreSubmissionInsert = Omit<StoreSubmissionRow, 'id' | 'submitted_at' | 'status'>

// =============================================================================
// Link Types (for linking engine)
// =============================================================================

export interface LinkItem {
  url: string
  label: string
  count?: number
}

// =============================================================================
// Vertical Profile (for import/discovery)
// =============================================================================

export interface SearchQuery {
  query: string
  intent: 'primary' | 'secondary'
}

export interface VerticalProfile {
  id: string
  displayName: string

  discovery: {
    queries: SearchQuery[]
    maxResultsPerCity: number
    maxResultsPerQuery: number
    searchRadiusMiles?: number
  }

  qualification: {
    requiredFields: Array<'place_id' | 'name' | 'address' | 'phone'>
    includeCategories?: string[]
    excludeCategories?: string[]
    minRating?: number
  }

  normalization: {
    phoneFormat: 'E164' | 'digits'
    slugStrategy: 'name-city' | 'name-city-place'
  }

  indexing: {
    cityMinListings: number
    aggregateNearby: boolean
    nearbyLimit: number
    listingIndexRule: 'phone-or-address' | 'phone-only'
  }

  compliance: {
    allowReviewText: boolean
    allowPhotos: boolean
    sourceAttributionRequired: boolean
  }
}
