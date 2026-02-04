/**
 * CityFAQ Component
 *
 * Dynamic FAQ section for city pages, gated behind ENABLE_CITY_ENRICHMENT.
 * Questions are selected based on available store data to ensure uniqueness.
 * Includes FAQPage schema for rich results.
 */

import type { Store } from '@/lib/types'
import { JsonLd, generateFAQPageSchema } from '@/lib/schema'

interface CityFAQProps {
  stores: Store[]
  cityName: string
  stateName: string
}

interface AggregatedData {
  totalStores: number
  deliveryCount: number
  installationCount: number
  avgRating: number | null
  ratedStoreCount: number
  applianceTypes: string[]
  dataPoints: number
}

function aggregateStoreData(stores: Store[]): AggregatedData {
  let deliveryCount = 0
  let installationCount = 0
  let ratingSum = 0
  let ratedStoreCount = 0
  const applianceSet = new Set<string>()

  for (const store of stores) {
    if (store.services?.delivery) deliveryCount++
    if (store.services?.installation) installationCount++
    if (store.rating && store.reviewCount) {
      ratingSum += store.rating
      ratedStoreCount++
    }
    if (store.appliances) {
      if (store.appliances.refrigerators) applianceSet.add('Refrigerators')
      if (store.appliances.washersAndDryers) applianceSet.add('Washers & Dryers')
      if (store.appliances.stovesAndRanges) applianceSet.add('Stoves & Ranges')
      if (store.appliances.dishwashers) applianceSet.add('Dishwashers')
    }
  }

  let dataPoints = 0
  if (deliveryCount > 0) dataPoints++
  if (ratedStoreCount > 0) dataPoints++
  if (applianceSet.size > 1) dataPoints++
  if (stores.length >= 3) dataPoints++

  return {
    totalStores: stores.length,
    deliveryCount,
    installationCount,
    avgRating: ratedStoreCount > 0 ? Math.round((ratingSum / ratedStoreCount) * 10) / 10 : null,
    ratedStoreCount,
    applianceTypes: Array.from(applianceSet),
    dataPoints,
  }
}

export function CityFAQ({ stores, cityName, stateName }: CityFAQProps) {
  const data = aggregateStoreData(stores)

  // Uniqueness gate: only render if 2+ data points
  if (data.dataPoints < 2) return null

  // Scale FAQ count based on store count
  let maxFaqs: number
  if (stores.length < 5) maxFaqs = 3
  else if (stores.length < 15) maxFaqs = 5
  else maxFaqs = 7

  // Build FAQ pool based on available data
  const faqs: { question: string; answer: string }[] = []

  faqs.push({
    question: `How many scratch and dent stores are in ${cityName}?`,
    answer: `Scratch & Dent Finder lists ${data.totalStores} scratch and dent appliance ${data.totalStores === 1 ? 'store' : 'stores'} in ${cityName}, ${stateName}.`,
  })

  if (data.deliveryCount > 0) {
    faqs.push({
      question: `Do stores in ${cityName} offer delivery?`,
      answer: `${data.deliveryCount} of ${data.totalStores} scratch and dent ${data.totalStores === 1 ? 'store' : 'stores'} in ${cityName} offer delivery. Check individual store listings for delivery details and service areas.`,
    })
  }

  if (data.applianceTypes.length > 1) {
    faqs.push({
      question: `What appliance types are available in ${cityName}?`,
      answer: `Stores in ${cityName} carry ${data.applianceTypes.join(', ')}. Availability varies by store and changes frequently as new inventory arrives.`,
    })
  }

  if (data.avgRating !== null && data.ratedStoreCount > 0) {
    faqs.push({
      question: `Are scratch and dent appliance stores in ${cityName} rated well?`,
      answer: `${data.ratedStoreCount} rated ${data.ratedStoreCount === 1 ? 'store' : 'stores'} in ${cityName} ${data.ratedStoreCount === 1 ? 'has' : 'have'} an average rating of ${data.avgRating} out of 5 based on customer reviews.`,
    })
  }

  if (data.installationCount > 0) {
    faqs.push({
      question: `Do ${cityName} stores offer installation?`,
      answer: `${data.installationCount} of ${data.totalStores} ${data.totalStores === 1 ? 'store' : 'stores'} in ${cityName} offer appliance installation services. Contact stores directly for installation pricing and scheduling.`,
    })
  }

  faqs.push({
    question: `What should I look for when buying scratch and dent appliances in ${cityName}?`,
    answer: `Inspect the appliance in person for cosmetic damage, confirm it includes a manufacturer warranty, and compare prices across ${cityName} stores. Ask about return policies before purchasing.`,
  })

  faqs.push({
    question: `How often does scratch and dent inventory change in ${cityName}?`,
    answer: `Scratch and dent inventory in ${cityName} changes frequently, often weekly. Call ahead to check availability and ask stores to notify you when specific appliances arrive.`,
  })

  const selectedFaqs = faqs.slice(0, maxFaqs)

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <JsonLd data={generateFAQPageSchema(selectedFaqs)} />
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {selectedFaqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-lg border border-gray-200 bg-white"
            >
              <summary className="cursor-pointer px-4 py-3 font-medium text-gray-900 hover:bg-gray-50">
                {faq.question}
              </summary>
              <p className="px-4 pb-4 text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
