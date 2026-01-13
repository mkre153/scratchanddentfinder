'use client'

/**
 * StoreMap — Slice 9: Maps Integration (Read-Only)
 *
 * Pure spatial index. No store details, no queries, no fetch.
 * Marker click scrolls to corresponding StoreCard.
 */

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Locked data contract — minimal props only
interface StoreMapProps {
  stores: { id: number; lat: number; lng: number }[]
  center: { lat: number; lng: number }
}

// Fix Leaflet default marker icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Numbered marker icon
function createNumberedIcon(index: number): L.DivIcon {
  return L.divIcon({
    className: 'store-marker',
    html: `<div style="
      background-color: #1d4ed8;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

// Component to fit bounds to all markers
function FitBounds({ stores }: { stores: StoreMapProps['stores'] }) {
  const map = useMap()

  useEffect(() => {
    if (stores.length === 0) return

    const bounds = L.latLngBounds(
      stores.map((s) => [s.lat, s.lng] as [number, number])
    )
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [map, stores])

  return null
}

export function StoreMap({ stores, center }: StoreMapProps) {
  // Filter out stores without valid coordinates
  const validStores = stores.filter(
    (s) => s.lat != null && s.lng != null && !isNaN(s.lat) && !isNaN(s.lng)
  )

  if (validStores.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        No store locations available
      </div>
    )
  }

  const handleMarkerClick = (storeId: number) => {
    const element = document.getElementById(`store-${storeId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-lg border border-gray-200">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds stores={validStores} />
        {validStores.map((store, index) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={createNumberedIcon(index)}
            eventHandlers={{
              click: () => handleMarkerClick(store.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  )
}
