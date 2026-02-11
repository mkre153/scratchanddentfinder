/**
 * MDX Components Registry
 * Only whitelisted components are exported for use in blog posts
 */

import { Callout } from './Callout'
import { Figure } from './Figure'
import { PriceComparison } from './PriceComparison'
import { BuyerChecklist } from './BuyerChecklist'
import { ComparisonTable } from './ComparisonTable'
import { FAQSection } from './FAQSection'
import { YouTubeEmbed } from './YouTubeEmbed'

// Whitelisted MDX components for blog posts and reviews
export const mdxComponents = {
  Callout,
  Figure,
  PriceComparison,
  BuyerChecklist,
  ComparisonTable,
  FAQSection,
  YouTubeEmbed,
}

export { Callout, Figure, PriceComparison, BuyerChecklist, ComparisonTable, FAQSection, YouTubeEmbed }
