/**
 * ComparisonTable MDX Component
 *
 * Side-by-side comparison table for blog posts.
 * Used for comparing products, options, or approaches.
 */

interface ComparisonItem {
  label: string
  optionA: string
  optionB: string
}

interface ComparisonTableProps {
  titleA: string
  titleB: string
  items: ComparisonItem[]
}

export function ComparisonTable({ titleA, titleB, items }: ComparisonTableProps) {
  return (
    <div className="not-prose my-8 overflow-x-auto">
      <table className="w-full border-collapse rounded-lg border border-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700">
              Feature
            </th>
            <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-sage-700">
              {titleA}
            </th>
            <th className="border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-blue-700">
              {titleB}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-900">
                {item.label}
              </td>
              <td className="border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
                {item.optionA}
              </td>
              <td className="border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
                {item.optionB}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
