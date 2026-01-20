'use client'

/**
 * BuyerToolWizard Component
 *
 * Main container for the multi-step Buyer's Tool wizard.
 * Orchestrates step navigation, form state, and displays results.
 */

import { useBuyerToolWizard } from '@/hooks/useBuyerToolWizard'
import { WizardProgress } from './WizardProgress'
import { ApplianceStep } from './steps/ApplianceStep'
import { DamageStep } from './steps/DamageStep'
import { RetailerStep } from './steps/RetailerStep'
import { WarrantyStep } from './steps/WarrantyStep'
import { ReturnPolicyStep } from './steps/ReturnPolicyStep'
import { InstallationStep } from './steps/InstallationStep'
import { BuyerContextStep } from './steps/BuyerContextStep'
import { InspectionStep } from './steps/InspectionStep'
import { ResultsStep } from './steps/ResultsStep'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

export function BuyerToolWizard() {
  const wizard = useBuyerToolWizard()

  const renderStep = () => {
    switch (wizard.currentStep) {
      case 0:
        return (
          <ApplianceStep
            data={wizard.formState.appliance}
            onChange={wizard.updateAppliance}
          />
        )
      case 1:
        return (
          <DamageStep
            data={wizard.formState.damage}
            onChange={wizard.updateDamage}
          />
        )
      case 2:
        return (
          <RetailerStep
            data={wizard.formState.retailer}
            onChange={wizard.updateRetailer}
          />
        )
      case 3:
        return (
          <WarrantyStep
            data={wizard.formState.warranty}
            onChange={wizard.updateWarranty}
          />
        )
      case 4:
        return (
          <ReturnPolicyStep
            data={wizard.formState.returnPolicy}
            onChange={wizard.updateReturnPolicy}
          />
        )
      case 5:
        return (
          <InstallationStep
            data={wizard.formState.installation}
            onChange={wizard.updateInstallation}
          />
        )
      case 6:
        return (
          <BuyerContextStep
            data={wizard.formState.buyerContext}
            onChange={wizard.updateBuyerContext}
          />
        )
      case 7:
        return (
          <InspectionStep
            data={wizard.formState.inspection}
            onChange={wizard.updateInspection}
          />
        )
      case 8:
        return wizard.output ? (
          <ResultsStep output={wizard.output} onReset={wizard.reset} />
        ) : null
      default:
        return null
    }
  }

  const isResultsStep = wizard.currentStep === 8
  const isLastInputStep = wizard.currentStep === 7

  return (
    <div className="mx-auto max-w-2xl">
      <WizardProgress
        currentStep={wizard.currentStep}
        onStepClick={wizard.goToStep}
      />

      {/* Validation Errors */}
      {wizard.validationErrors.length > 0 && (
        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {wizard.validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Step Content */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {!isResultsStep && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={wizard.goToPreviousStep}
            disabled={!wizard.canGoPrevious}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={wizard.goToNextStep}
            disabled={wizard.isCompiling}
            className="inline-flex items-center gap-2 rounded-lg bg-sage-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-sage-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {wizard.isCompiling ? (
              'Analyzing...'
            ) : isLastInputStep ? (
              <>
                Analyze My Deal
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Results Step - Start Over Button */}
      {isResultsStep && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={wizard.reset}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <RotateCcw className="h-4 w-4" />
            Analyze Another Deal
          </button>
        </div>
      )}
    </div>
  )
}
