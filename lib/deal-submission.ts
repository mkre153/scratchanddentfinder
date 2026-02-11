/**
 * Deal Submission Validation
 *
 * Validates deal form data before submission.
 * Mirrors the pattern from lib/store-submission.ts.
 */

import type { ApplianceType, DealCondition } from '@/lib/types'

export interface DealFormData {
  submitterName: string
  submitterEmail: string
  submitterPhone: string
  storeName: string
  storeId: number | null
  title: string
  applianceType: ApplianceType | ''
  brand: string
  modelNumber: string
  originalPrice: string
  dealPrice: string
  condition: DealCondition | ''
  damageDescription: string
  description: string
  city: string
  state: string
  zip: string
  photoPaths: string[]
}

export interface DealValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export const APPLIANCE_TYPES: { value: ApplianceType; label: string }[] = [
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'washer', label: 'Washer' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'range', label: 'Range / Oven' },
  { value: 'microwave', label: 'Microwave' },
  { value: 'freezer', label: 'Freezer' },
  { value: 'other', label: 'Other' },
]

export const CONDITION_OPTIONS: { value: DealCondition; label: string }[] = [
  { value: 'new', label: 'New (unopened)' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

export function validateDealForm(data: DealFormData): DealValidationResult {
  const errors: Record<string, string> = {}

  // Submitter info
  if (!data.submitterName?.trim()) {
    errors.submitterName = 'Your name is required'
  }

  if (!data.submitterEmail?.trim()) {
    errors.submitterEmail = 'Email is required'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.submitterEmail.trim())) {
      errors.submitterEmail = 'Please enter a valid email address'
    }
  }

  // Deal details
  if (!data.title?.trim()) {
    errors.title = 'Deal title is required'
  } else if (data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters'
  } else if (data.title.trim().length > 120) {
    errors.title = 'Title must be under 120 characters'
  }

  if (!data.applianceType) {
    errors.applianceType = 'Appliance type is required'
  }

  if (!data.dealPrice?.trim()) {
    errors.dealPrice = 'Deal price is required'
  } else {
    const price = parseFloat(data.dealPrice)
    if (isNaN(price) || price <= 0) {
      errors.dealPrice = 'Please enter a valid price'
    }
  }

  if (data.originalPrice?.trim()) {
    const price = parseFloat(data.originalPrice)
    if (isNaN(price) || price <= 0) {
      errors.originalPrice = 'Please enter a valid price'
    }
  }

  if (!data.condition) {
    errors.condition = 'Condition is required'
  }

  if (!data.damageDescription?.trim()) {
    errors.damageDescription = 'Damage description is required'
  } else if (data.damageDescription.trim().length < 10) {
    errors.damageDescription = 'Please provide at least 10 characters'
  } else if (data.damageDescription.trim().length > 500) {
    errors.damageDescription = 'Must be under 500 characters'
  }

  if (!data.description?.trim()) {
    errors.description = 'Description is required'
  } else if (data.description.trim().length < 20) {
    errors.description = 'Please provide at least 20 characters'
  } else if (data.description.trim().length > 1000) {
    errors.description = 'Must be under 1000 characters'
  }

  // Location
  if (!data.city?.trim()) {
    errors.city = 'City is required'
  }

  if (!data.state?.trim()) {
    errors.state = 'State is required'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
