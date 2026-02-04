/**
 * StoreCard Component
 *
 * Displays a store card with name, address, contact info, and services.
 * Uses tracked CTA components (Slice 3) for phone, directions, website.
 */

import type { Store } from '@/lib/types'
import { PhoneLink, DirectionsLink, WebsiteLink } from '@/components/cta'
import { DistanceBadge } from './DistanceBadge'

interface StoreCardProps {
  store: Store
  index?: number // Optional - featured stores don't need numbering
}

function getStoreStatus(hours: Store['hours']): {
  isOpen: boolean
  statusText: string | null
} {
  if (!hours) return { isOpen: false, statusText: null }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayIndex = new Date().getDay()
  const today = days[todayIndex]
  const todaySchedule = hours[today]

  // Store is open today
  if (todaySchedule && todaySchedule !== 'closed') {
    const { close } = todaySchedule
    return { isOpen: true, statusText: `Open until ${close}` }
  }

  // Store is closed today - find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (todayIndex + i) % 7
    const nextDay = days[nextDayIndex]
    const nextSchedule = hours[nextDay]

    if (nextSchedule && nextSchedule !== 'closed') {
      const dayLabel = i === 1 ? 'tomorrow' : dayNames[nextDayIndex]
      return { isOpen: false, statusText: `Closed · Opens ${dayLabel} at ${nextSchedule.open}` }
    }
  }

  return { isOpen: false, statusText: 'Closed' }
}

export function StoreCard({ store, index }: StoreCardProps) {
  const { isOpen, statusText } = getStoreStatus(store.hours)

  return (
    <article
      className={`rounded-lg border p-6 ${
        store.isFeatured
          ? 'border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50 to-white shadow-md'
          : 'bg-white shadow-sm'
      }`}
      data-testid="store-card"
    >
      <div className="flex items-start gap-4">
        {/* Star Badge for Featured, Numbered Badge for Regular */}
        {store.isFeatured ? (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        ) : (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sage-100 text-sm font-bold text-sage-700">
            {(index ?? 0) + 1}
          </div>
        )}

        <div className="flex-1">
          {/* Store Name + Featured Badge + Open/Closed Status */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
            {store.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            )}
            {statusText && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                {statusText}
              </span>
            )}
            {store.rating && store.reviewCount && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {store.rating} ({store.reviewCount})
              </span>
            )}
            <DistanceBadge
              storeLat={store.lat}
              storeLng={store.lng}
              className="text-xs text-gray-500"
            />
          </div>

          {/* Full Weekly Hours */}
          {store.hours && (
            <details className="mt-2 text-sm text-gray-600">
              <summary className="cursor-pointer hover:text-gray-900">View hours</summary>
              <div className="mt-1 space-y-0.5 pl-2">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                  const schedule = store.hours![day]
                  if (!schedule) return null
                  return (
                    <div key={day} className="flex justify-between max-w-xs">
                      <span className="capitalize">{day}</span>
                      <span>{schedule === 'closed' ? 'Closed' : `${schedule.open} – ${schedule.close}`}</span>
                    </div>
                  )
                })}
              </div>
            </details>
          )}

          {/* Address */}
          <p className="mt-1 flex items-center gap-1 text-gray-600">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {store.address}
          </p>

          {/* Phone */}
          {store.phone && (
            <p className="mt-1 flex items-center gap-1 text-gray-600">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <PhoneLink
                storeId={store.id}
                phone={store.phone}
                className="hover:text-blue-700 hover:underline"
              />
            </p>
          )}

          {/* Directions */}
          <p className="mt-1 flex items-center gap-1 text-gray-600">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <DirectionsLink
              storeId={store.id}
              address={store.address}
              className="hover:text-blue-700 hover:underline"
            />
          </p>

          {/* Appliances - Show only available, max 3 */}
          {store.appliances && (() => {
            const availableAppliances: string[] = []
            if (store.appliances.refrigerators) availableAppliances.push('Refrigerators')
            if (store.appliances.washersAndDryers) availableAppliances.push('Washers & Dryers')
            if (store.appliances.stovesAndRanges) availableAppliances.push('Stoves & Ranges')
            if (store.appliances.dishwashers) availableAppliances.push('Dishwashers')

            if (availableAppliances.length === 0) return null

            return (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {availableAppliances.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {label}
                  </span>
                ))}
              </div>
            )
          })()}

          {/* Service Badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {store.services?.delivery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-2 py-0.5 text-xs text-sage-700">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Delivers
              </span>
            )}
            {store.services?.installation && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-2 py-0.5 text-xs text-sage-700">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Installs
              </span>
            )}
          </div>

          {/* Website */}
          {store.website && (
            <p className="mt-1 flex items-center gap-1 text-gray-600">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <WebsiteLink
                storeId={store.id}
                url={store.website}
                className="hover:text-blue-700 hover:underline"
              />
            </p>
          )}

        </div>
      </div>
    </article>
  )
}

