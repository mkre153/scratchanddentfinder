/**
 * HowItWorks Component
 *
 * Explains scratch & dent concept in exactly 3 steps.
 * Used on Homepage per UX template requirements.
 *
 * Template spec: Each step ≤ 1 sentence. No warranty deep-dive.
 */

import { Dumbbell, BadgePercent, ThumbsUp } from 'lucide-react'

const steps = [
  {
    icon: Dumbbell,
    number: '1',
    title: 'Minor Cosmetic Damage',
    description: 'Small dents, scratches, or packaging flaws from shipping and handling.',
  },
  {
    icon: BadgePercent,
    number: '2',
    title: 'Big Discounts',
    description: 'Save 20–60% off retail prices on brand-name appliances.',
  },
  {
    icon: ThumbsUp,
    number: '3',
    title: 'Fully Functional',
    description: 'Same performance and warranty coverage as new appliances.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-gray-50 py-12" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          How Scratch & Dent Works
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-100">
                <step.icon className="h-6 w-6 text-sage-700" />
              </div>
              <div className="mb-2 text-sm font-semibold text-sage-600">
                Step {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
