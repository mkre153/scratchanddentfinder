/**
 * CityBuyingGuide Component
 *
 * Data-driven buying guide for city pages, gated behind ENABLE_CITY_ENRICHMENT.
 * Sections render conditionally based on available store data.
 */

import type { Store } from '@/lib/types'

interface CityBuyingGuideProps {
  stores: Store[]
  cityName: string
  stateName: string
}

export function CityBuyingGuide({ stores, cityName, stateName }: CityBuyingGuideProps) {
  // Aggregate data
  let deliveryCount = 0
  let installationCount = 0
  const applianceSet = new Set<string>()

  for (const store of stores) {
    if (store.services?.delivery) deliveryCount++
    if (store.services?.installation) installationCount++
    if (store.appliances) {
      if (store.appliances.refrigerators) applianceSet.add('Refrigerators')
      if (store.appliances.washersAndDryers) applianceSet.add('Washers & Dryers')
      if (store.appliances.stovesAndRanges) applianceSet.add('Stoves & Ranges')
      if (store.appliances.dishwashers) applianceSet.add('Dishwashers')
    }
  }

  // Uniqueness gate: 2+ data points
  let dataPoints = 0
  if (deliveryCount > 0) dataPoints++
  if (applianceSet.size > 1) dataPoints++
  if (stores.length >= 3) dataPoints++
  // Count rated stores as a data point
  const hasRatedStores = stores.some((s) => s.rating && s.reviewCount)
  if (hasRatedStores) dataPoints++

  if (dataPoints < 2) return null

  const hasDeliveryOrInstallation = deliveryCount > 0 || installationCount > 0
  const hasApplianceData = applianceSet.size > 0

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900">
            Shopping for Scratch & Dent in {cityName}
          </h2>
          <p className="mt-3 text-gray-600">
            {cityName}, {stateName} has {stores.length} scratch and dent appliance{' '}
            {stores.length === 1 ? 'store' : 'stores'} listed on Scratch & Dent
            Finder. These stores sell appliances with minor cosmetic imperfections at
            reduced prices while maintaining full manufacturer warranty coverage.
          </p>

          {hasDeliveryOrInstallation && (
            <>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Delivery & Installation
              </h3>
              <p className="mt-2 text-gray-600">
                {deliveryCount > 0 && (
                  <>
                    {deliveryCount} of {stores.length}{' '}
                    {stores.length === 1 ? 'store' : 'stores'} in {cityName} offer
                    delivery.
                  </>
                )}
                {deliveryCount > 0 && installationCount > 0 && ' '}
                {installationCount > 0 && (
                  <>
                    {installationCount}{' '}
                    {installationCount === 1 ? 'store offers' : 'stores offer'}{' '}
                    installation services.
                  </>
                )}
                {' '}Contact stores directly for service area details and scheduling.
              </p>
            </>
          )}

          {hasApplianceData && (
            <>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                What's Available
              </h3>
              <p className="mt-2 text-gray-600">
                Stores in {cityName} carry {Array.from(applianceSet).join(', ')}.
                Inventory changes frequently as new shipments arrive, so selection
                varies from week to week.
              </p>
            </>
          )}

          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            Tips for {cityName} Shoppers
          </h3>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li>Call ahead to check availability before visiting</li>
            <li>Inspect appliances in person to assess cosmetic damage</li>
            <li>
              Compare prices across{' '}
              {stores.length > 1 ? `${cityName}'s ${stores.length} stores` : 'stores'}{' '}
              for the best deal
            </li>
            <li>Ask about warranty coverage and return policies</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
