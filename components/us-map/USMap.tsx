'use client'

import React, { useState, useMemo } from 'react'
import { STATE_PATHS } from './data/paths'
import { STATE_NAMES } from './data/names'
import { STATE_CENTROIDS } from './data/centroids'

export interface StateConfig {
  color?: string
  hoverColor?: string
  description?: string
  url?: string
  data?: Record<string, unknown>
}

export interface LocationMarker {
  id: string
  lat: number
  lng: number
  label?: string
  color?: string
  size?: number
  shape?: 'circle' | 'square' | 'triangle'
  data?: Record<string, unknown>
}

export interface USMapProps {
  defaultColor?: string
  defaultHoverColor?: string
  strokeColor?: string
  strokeWidth?: number
  stateConfig?: Record<string, StateConfig>
  markers?: LocationMarker[]
  onStateClick?: (stateCode: string, config?: StateConfig) => void
  onStateHover?: (stateCode: string | null, config?: StateConfig) => void
  onMarkerClick?: (marker: LocationMarker) => void
  showTooltip?: boolean
  showLabels?: boolean
  labelColor?: string
  labelSize?: number
  width?: number | string
  height?: number | string
  className?: string
}

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 125) / 59) * 959
  const y = ((50 - lat) / 26) * 593
  return { x, y }
}

export function USMap({
  defaultColor = '#D1D5DB',
  defaultHoverColor = '#9CA3AF',
  strokeColor = '#FFFFFF',
  strokeWidth = 1,
  stateConfig = {},
  markers = [],
  onStateClick,
  onStateHover,
  onMarkerClick,
  showTooltip = true,
  showLabels = false,
  labelColor = '#1f2937',
  labelSize = 12,
  width = '100%',
  height = 'auto',
  className = '',
}: USMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (code: string, e: React.MouseEvent) => {
    setHoveredState(code)
    setTooltipPos({ x: e.clientX, y: e.clientY })
    onStateHover?.(code, stateConfig[code])
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredState(null)
    onStateHover?.(null)
  }

  const handleStateClick = (code: string) => {
    const config = stateConfig[code]
    if (config?.url) window.open(config.url, '_blank')
    onStateClick?.(code, config)
  }

  const getColor = (code: string, isHovered: boolean) => {
    const config = stateConfig[code]
    if (isHovered) return config?.hoverColor || defaultHoverColor
    return config?.color || defaultColor
  }

  const renderMarker = (marker: LocationMarker) => {
    const { x, y } = latLngToSvg(marker.lat, marker.lng)
    const size = marker.size || 6
    const color = marker.color || '#EF4444'
    const props = {
      fill: color,
      style: { cursor: 'pointer' } as React.CSSProperties,
      onClick: () => onMarkerClick?.(marker),
    }

    switch (marker.shape) {
      case 'square':
        return <rect key={marker.id} x={x - size / 2} y={y - size / 2} width={size} height={size} {...props} />
      case 'triangle':
        return <polygon key={marker.id} points={`${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`} {...props} />
      default:
        return <circle key={marker.id} cx={x} cy={y} r={size / 2} {...props} />
    }
  }

  const tooltipContent = useMemo(() => {
    if (!hoveredState) return null
    const config = stateConfig[hoveredState]
    return (
      <div>
        <div className="font-semibold">{STATE_NAMES[hoveredState]}</div>
        {config?.description && <div className="text-sm text-gray-600">{config.description}</div>}
      </div>
    )
  }, [hoveredState, stateConfig])

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg viewBox="0 0 959 593" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        {/* Layer 1: State paths */}
        <g>
          {Object.entries(STATE_PATHS).map(([code, path]) => (
            <path
              key={code}
              d={path}
              fill={getColor(code, hoveredState === code)}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
              onMouseEnter={(e) => handleMouseEnter(code, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleStateClick(code)}
            />
          ))}
        </g>

        {/* Layer 2: Markers */}
        <g>{markers.map(renderMarker)}</g>

        {/* Layer 3: State labels (on top of everything) */}
        {showLabels && (
          <g>
            {Object.entries(STATE_CENTROIDS).map(([code, pos]) => (
              <text
                key={`label-${code}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={labelColor}
                fontSize={labelSize}
                fontWeight={700}
                fontFamily="system-ui, -apple-system, sans-serif"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {code}
              </text>
            ))}
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredState && (
        <div
          className="fixed z-50 bg-white shadow-lg rounded-lg px-3 py-2 pointer-events-none border"
          style={{ left: tooltipPos.x + 10, top: tooltipPos.y + 10 }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  )
}

export default USMap
