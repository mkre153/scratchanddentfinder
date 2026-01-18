'use client'

/**
 * WizardProgress Component
 *
 * Displays step progress indicator for the Buyer's Tool wizard.
 * Shows current step, total steps, and allows navigation to previous steps.
 */

import { Check } from 'lucide-react'

const STEP_LABELS = [
  'Appliance',
  'Damage',
  'Retailer',
  'Warranty',
  'Returns',
  'Installation',
  'Your Situation',
  'Inspection',
]

interface WizardProgressProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  const isResultsStep = currentStep === 8
  const totalSteps = STEP_LABELS.length

  return (
    <div className="mb-8">
      {/* Mobile: Simple text indicator */}
      <div className="mb-4 sm:hidden">
        {isResultsStep ? (
          <p className="text-center text-sm font-medium text-sage-600">
            Results
          </p>
        ) : (
          <p className="text-center text-sm text-gray-600">
            Step {currentStep + 1} of {totalSteps}:{' '}
            <span className="font-medium text-gray-900">
              {STEP_LABELS[currentStep]}
            </span>
          </p>
        )}
      </div>

      {/* Desktop: Step indicators */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center space-x-2">
            {STEP_LABELS.map((label, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isClickable = isCompleted && onStepClick

              return (
                <li key={label} className="flex items-center">
                  {index > 0 && (
                    <div
                      className={`mx-1 h-0.5 w-6 lg:w-10 ${
                        isCompleted ? 'bg-sage-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(index)}
                    disabled={!isClickable}
                    className={`group flex flex-col items-center ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        isCompleted
                          ? 'bg-sage-500 text-white'
                          : isCurrent
                            ? 'border-2 border-sage-500 bg-white text-sage-600'
                            : 'border-2 border-gray-200 bg-white text-gray-400'
                      } ${isClickable ? 'group-hover:bg-sage-600' : ''}`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={`mt-1 hidden text-xs lg:block ${
                        isCurrent
                          ? 'font-medium text-sage-600'
                          : isCompleted
                            ? 'text-gray-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* Progress bar for mobile */}
      {!isResultsStep && (
        <div className="mt-2 sm:hidden">
          <div className="h-1 w-full rounded-full bg-gray-200">
            <div
              className="h-1 rounded-full bg-sage-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
