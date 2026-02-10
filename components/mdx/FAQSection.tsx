/**
 * FAQSection MDX Component
 *
 * Renders FAQ blocks within blog content.
 * Complements the structured FAQ data in frontmatter (used for schema markup).
 * This component is for visual display within the article body.
 */

interface FAQItem {
  q: string
  a: string
}

interface FAQSectionProps {
  items: FAQItem[]
  title?: string
}

export function FAQSection({ items, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  return (
    <div className="not-prose my-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <details
            key={index}
            className="group rounded-lg border border-slate-200 bg-white"
          >
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50">
              {item.q}
              <svg
                className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
