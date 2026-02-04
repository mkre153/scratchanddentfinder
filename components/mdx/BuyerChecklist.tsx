/**
 * BuyerChecklist component for blog posts
 * Interactive checklist for appliance inspection
 */

interface BuyerChecklistProps {
  title?: string
  items: string[]
}

export function BuyerChecklist({
  title = 'Inspection Checklist',
  items,
}: BuyerChecklistProps) {
  return (
    <div className="my-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
      <div className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-sage-600 text-white flex items-center justify-center text-xs">
          ✓
        </span>
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
