/**
 * PriceComparison component for blog posts
 * Shows retail vs scratch & dent price comparison
 */

interface PriceComparisonProps {
  product: string
  retail: number
  scratchDent: number
  savings?: string
}

export function PriceComparison({
  product,
  retail,
  scratchDent,
  savings,
}: PriceComparisonProps) {
  const calculatedSavings = savings || `${Math.round(((retail - scratchDent) / retail) * 100)}%`
  const dollarSavings = retail - scratchDent

  return (
    <div className="my-6 bg-sage-50 border border-sage-200 rounded-lg p-4">
      <div className="text-sm font-medium text-sage-800 mb-3">{product}</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Retail Price
          </div>
          <div className="text-lg font-semibold text-slate-400 line-through">
            ${retail.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Scratch & Dent
          </div>
          <div className="text-lg font-semibold text-sage-700">
            ${scratchDent.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-sage-200 flex justify-between items-center">
        <span className="text-sm text-slate-600">Your Savings</span>
        <span className="font-bold text-sage-700">
          ${dollarSavings.toLocaleString()} ({calculatedSavings})
        </span>
      </div>
    </div>
  )
}
