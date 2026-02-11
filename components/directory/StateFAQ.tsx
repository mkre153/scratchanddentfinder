import type { State } from '@/lib/types'
import { JsonLd, generateFAQPageSchema } from '@/lib/schema'

interface StateFAQProps {
  state: State
}

function buildFAQs(state: State) {
  return [
    {
      question: `How many scratch and dent appliance stores are in ${state.name}?`,
      answer: `There are currently ${state.storeCount} scratch and dent appliance stores across ${state.cityCount} cities in ${state.name}. Inventory and store counts are updated regularly.`,
    },
    {
      question: `Are scratch and dent appliances in ${state.name} covered by warranty?`,
      answer: `Most scratch and dent appliances sold at ${state.name} stores come with the full manufacturer warranty. The cosmetic damage that qualifies an appliance as "scratch and dent" does not affect the warranty coverage. Always ask the store to confirm warranty details before purchasing.`,
    },
    {
      question: `How much can I save on scratch and dent appliances in ${state.name}?`,
      answer: `Shoppers in ${state.name} typically save 20-60% off retail prices on scratch and dent appliances. The exact discount depends on the type and severity of cosmetic damage, the brand, and the specific store's pricing strategy.`,
    },
    {
      question: `What types of appliances are available as scratch and dent in ${state.name}?`,
      answer: `${state.name} scratch and dent stores commonly carry refrigerators, washers, dryers, dishwashers, ranges, ovens, and microwaves from major brands. Inventory rotates frequently, so calling ahead or visiting regularly gives you the best selection.`,
    },
  ]
}

export function StateFAQ({ state }: StateFAQProps) {
  const faqs = buildFAQs(state)

  return (
    <>
      <JsonLd data={generateFAQPageSchema(faqs)} />
      <section className="py-10 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Frequently Asked Questions — {state.name}
          </h2>
          <div className="max-w-3xl space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
