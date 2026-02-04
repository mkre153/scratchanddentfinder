/**
 * MDX Components Registry
 * Only whitelisted components are exported for use in blog posts
 */

import { Callout } from './Callout'
import { Figure } from './Figure'
import { PriceComparison } from './PriceComparison'
import { BuyerChecklist } from './BuyerChecklist'

// Whitelisted MDX components for blog posts
export const mdxComponents = {
  Callout,
  Figure,
  PriceComparison,
  BuyerChecklist,
}

export { Callout, Figure, PriceComparison, BuyerChecklist }
