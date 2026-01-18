'use client'

/**
 * Buyer's Tool Wizard State Management Hook
 *
 * Manages multi-step wizard state, validation, and compilation.
 * Uses the @scratch-and-dent/buyers-tool compiler for decision logic.
 */

import { useState, useCallback, useMemo } from 'react'
import {
  compile,
  type BuyerInput,
  type CompilerOutput,
  type ApplianceInfo,
  type DamageInfo,
  type RetailerInfo,
  type WarrantyInfo,
  type ReturnPolicyInfo,
  type InstallationInfo,
  type BuyerContext,
  type InspectionResults,
} from '@/lib/buyers-tool'

// Step identifiers
export const WIZARD_STEPS = [
  'appliance',
  'damage',
  'retailer',
  'warranty',
  'returnPolicy',
  'installation',
  'buyerContext',
  'inspection',
  'results',
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]

// Form state for each step (allowing partial data during editing)
export interface WizardFormState {
  appliance: Partial<ApplianceInfo>
  damage: Partial<DamageInfo>
  retailer: Partial<RetailerInfo>
  warranty: Partial<WarrantyInfo>
  returnPolicy: Partial<ReturnPolicyInfo>
  installation: Partial<InstallationInfo>
  buyerContext: Partial<BuyerContext>
  inspection: Partial<InspectionResults>
}

// Initial empty form state
const initialFormState: WizardFormState = {
  appliance: {},
  damage: {
    locations: [],
    types: [],
  },
  retailer: {},
  warranty: {},
  returnPolicy: {},
  installation: {
    visibleSides: [],
  },
  buyerContext: {},
  inspection: {},
}

// Validation rules for each step
function validateAppliance(data: Partial<ApplianceInfo>): string[] {
  const errors: string[] = []
  if (!data.type) errors.push('Please select an appliance type')
  if (!data.retailPrice || data.retailPrice <= 0)
    errors.push('Please enter the retail price')
  if (!data.askingPrice || data.askingPrice <= 0)
    errors.push('Please enter the asking price')
  if (data.askingPrice && data.retailPrice && data.askingPrice > data.retailPrice)
    errors.push('Asking price cannot exceed retail price')
  return errors
}

function validateDamage(data: Partial<DamageInfo>): string[] {
  const errors: string[] = []
  if (!data.locations || data.locations.length === 0)
    errors.push('Please select at least one damage location')
  if (!data.severity) errors.push('Please select damage severity')
  if (!data.types || data.types.length === 0)
    errors.push('Please select at least one damage type')
  return errors
}

function validateRetailer(data: Partial<RetailerInfo>): string[] {
  const errors: string[] = []
  if (!data.type) errors.push('Please select a retailer type')
  return errors
}

function validateWarranty(data: Partial<WarrantyInfo>): string[] {
  const errors: string[] = []
  if (data.manufacturerCovered === undefined)
    errors.push('Please indicate if manufacturer warranty is covered')
  if (data.retailerWarrantyMonths === undefined)
    errors.push('Please enter retailer warranty months (0 if none)')
  return errors
}

function validateReturnPolicy(data: Partial<ReturnPolicyInfo>): string[] {
  const errors: string[] = []
  if (data.windowDays === undefined)
    errors.push('Please enter return window days (0 if none)')
  if (data.finalSale === undefined)
    errors.push('Please indicate if this is a final sale')
  return errors
}

function validateInstallation(data: Partial<InstallationInfo>): string[] {
  const errors: string[] = []
  if (!data.type) errors.push('Please select installation type')
  if (!data.visibleSides || data.visibleSides.length === 0)
    errors.push('Please select at least one visible side')
  return errors
}

function validateBuyerContext(data: Partial<BuyerContext>): string[] {
  const errors: string[] = []
  if (!data.purpose) errors.push('Please select your purchase purpose')
  if (!data.riskTolerance) errors.push('Please select your risk tolerance')
  if (!data.priceFlexibility) errors.push('Please indicate price flexibility')
  return errors
}

// Inspection step is optional - no validation required
function validateInspection(): string[] {
  return []
}

export interface UseBuyerToolWizardReturn {
  // Current state
  currentStep: number
  currentStepName: WizardStep
  formState: WizardFormState
  validationErrors: string[]
  output: CompilerOutput | null
  isCompiling: boolean

  // Navigation
  canGoNext: boolean
  canGoPrevious: boolean
  goToNextStep: () => void
  goToPreviousStep: () => void
  goToStep: (step: number) => void

  // Form updates
  updateAppliance: (data: Partial<ApplianceInfo>) => void
  updateDamage: (data: Partial<DamageInfo>) => void
  updateRetailer: (data: Partial<RetailerInfo>) => void
  updateWarranty: (data: Partial<WarrantyInfo>) => void
  updateReturnPolicy: (data: Partial<ReturnPolicyInfo>) => void
  updateInstallation: (data: Partial<InstallationInfo>) => void
  updateBuyerContext: (data: Partial<BuyerContext>) => void
  updateInspection: (data: Partial<InspectionResults>) => void

  // Actions
  validateCurrentStep: () => boolean
  runCompiler: () => void
  reset: () => void
}

export function useBuyerToolWizard(): UseBuyerToolWizardReturn {
  const [currentStep, setCurrentStep] = useState(0)
  const [formState, setFormState] = useState<WizardFormState>(initialFormState)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [output, setOutput] = useState<CompilerOutput | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)

  const currentStepName = WIZARD_STEPS[currentStep] ?? 'appliance'
  const totalInputSteps = 8 // Steps 0-7 are input, step 8 is results

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    let errors: string[] = []

    switch (currentStep) {
      case 0:
        errors = validateAppliance(formState.appliance)
        break
      case 1:
        errors = validateDamage(formState.damage)
        break
      case 2:
        errors = validateRetailer(formState.retailer)
        break
      case 3:
        errors = validateWarranty(formState.warranty)
        break
      case 4:
        errors = validateReturnPolicy(formState.returnPolicy)
        break
      case 5:
        errors = validateInstallation(formState.installation)
        break
      case 6:
        errors = validateBuyerContext(formState.buyerContext)
        break
      case 7:
        errors = validateInspection()
        break
    }

    setValidationErrors(errors)
    return errors.length === 0
  }, [currentStep, formState])

  // Build complete BuyerInput from form state
  const buildBuyerInput = useCallback((): BuyerInput | null => {
    try {
      // Ensure all required fields are present
      const { appliance, damage, retailer, warranty, returnPolicy, installation, buyerContext, inspection } = formState

      if (!appliance.type || !appliance.retailPrice || !appliance.askingPrice) return null
      if (!damage.locations?.length || !damage.severity || !damage.types?.length) return null
      if (!retailer.type) return null
      if (warranty.manufacturerCovered === undefined || warranty.retailerWarrantyMonths === undefined) return null
      if (returnPolicy.windowDays === undefined || returnPolicy.finalSale === undefined) return null
      if (!installation.type || !installation.visibleSides?.length) return null
      if (!buyerContext.purpose || !buyerContext.riskTolerance || !buyerContext.priceFlexibility) return null

      return {
        appliance: {
          type: appliance.type,
          brand: appliance.brand,
          model: appliance.model,
          retailPrice: appliance.retailPrice,
          askingPrice: appliance.askingPrice,
        },
        damage: {
          locations: damage.locations,
          severity: damage.severity,
          types: damage.types,
        },
        retailer: {
          type: retailer.type,
          inventoryAgeDays: retailer.inventoryAgeDays,
        },
        warranty: {
          manufacturerCovered: warranty.manufacturerCovered,
          retailerWarrantyMonths: warranty.retailerWarrantyMonths,
          laborIncluded: warranty.laborIncluded ?? false,
          partsIncluded: warranty.partsIncluded ?? false,
          extendedAvailable: warranty.extendedAvailable ?? false,
        },
        returnPolicy: {
          windowDays: returnPolicy.windowDays,
          restockingFeePercent: returnPolicy.restockingFeePercent ?? 0,
          finalSale: returnPolicy.finalSale,
        },
        installation: {
          type: installation.type,
          visibleSides: installation.visibleSides,
        },
        buyer: {
          purpose: buyerContext.purpose,
          riskTolerance: buyerContext.riskTolerance,
          priceFlexibility: buyerContext.priceFlexibility,
        },
        // Only include inspection if any fields are set (all fields required when provided)
        inspection: Object.keys(inspection).length > 0 ? {
          powerOnWorks: inspection.powerOnWorks ?? false,
          unusualSounds: inspection.unusualSounds ?? false,
          rustPresent: inspection.rustPresent ?? false,
          waterStains: inspection.waterStains ?? false,
          cordDamaged: inspection.cordDamaged ?? false,
          odorsPresent: inspection.odorsPresent ?? false,
          missingParts: inspection.missingParts ?? false,
          priorRepairsEvident: inspection.priorRepairsEvident ?? false,
        } : undefined,
      }
    } catch {
      return null
    }
  }, [formState])

  // Run compiler
  const runCompiler = useCallback(() => {
    const input = buildBuyerInput()
    if (!input) {
      setValidationErrors(['Please complete all required fields before analyzing'])
      return
    }

    setIsCompiling(true)
    try {
      const result = compile(input, { timestamp: new Date().toISOString() })
      setOutput(result)
      setCurrentStep(8) // Move to results step
    } catch (err) {
      setValidationErrors([
        'Error analyzing your deal. Please check your inputs and try again.',
      ])
      console.error('Compiler error:', err)
    } finally {
      setIsCompiling(false)
    }
  }, [buildBuyerInput])

  // Navigation
  const goToNextStep = useCallback(() => {
    if (currentStep < totalInputSteps - 1) {
      if (validateCurrentStep()) {
        setCurrentStep((prev) => prev + 1)
        setValidationErrors([])
      }
    } else if (currentStep === totalInputSteps - 1) {
      // On last input step, run compiler
      if (validateCurrentStep()) {
        runCompiler()
      }
    }
  }, [currentStep, validateCurrentStep, runCompiler])

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      setValidationErrors([])
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= totalInputSteps) {
      setCurrentStep(step)
      setValidationErrors([])
    }
  }, [])

  // Form update functions
  const updateAppliance = useCallback((data: Partial<ApplianceInfo>) => {
    setFormState((prev) => ({
      ...prev,
      appliance: { ...prev.appliance, ...data },
    }))
  }, [])

  const updateDamage = useCallback((data: Partial<DamageInfo>) => {
    setFormState((prev) => ({
      ...prev,
      damage: { ...prev.damage, ...data },
    }))
  }, [])

  const updateRetailer = useCallback((data: Partial<RetailerInfo>) => {
    setFormState((prev) => ({
      ...prev,
      retailer: { ...prev.retailer, ...data },
    }))
  }, [])

  const updateWarranty = useCallback((data: Partial<WarrantyInfo>) => {
    setFormState((prev) => ({
      ...prev,
      warranty: { ...prev.warranty, ...data },
    }))
  }, [])

  const updateReturnPolicy = useCallback((data: Partial<ReturnPolicyInfo>) => {
    setFormState((prev) => ({
      ...prev,
      returnPolicy: { ...prev.returnPolicy, ...data },
    }))
  }, [])

  const updateInstallation = useCallback((data: Partial<InstallationInfo>) => {
    setFormState((prev) => ({
      ...prev,
      installation: { ...prev.installation, ...data },
    }))
  }, [])

  const updateBuyerContext = useCallback((data: Partial<BuyerContext>) => {
    setFormState((prev) => ({
      ...prev,
      buyerContext: { ...prev.buyerContext, ...data },
    }))
  }, [])

  const updateInspection = useCallback((data: Partial<InspectionResults>) => {
    setFormState((prev) => ({
      ...prev,
      inspection: { ...prev.inspection, ...data },
    }))
  }, [])

  // Reset wizard
  const reset = useCallback(() => {
    setCurrentStep(0)
    setFormState(initialFormState)
    setValidationErrors([])
    setOutput(null)
  }, [])

  // Computed navigation states
  const canGoPrevious = currentStep > 0 && currentStep < 9
  const canGoNext = useMemo(() => {
    if (currentStep >= 8) return false
    return true
  }, [currentStep])

  return {
    currentStep,
    currentStepName,
    formState,
    validationErrors,
    output,
    isCompiling,
    canGoNext,
    canGoPrevious,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateAppliance,
    updateDamage,
    updateRetailer,
    updateWarranty,
    updateReturnPolicy,
    updateInstallation,
    updateBuyerContext,
    updateInspection,
    validateCurrentStep,
    runCompiler,
    reset,
  }
}
