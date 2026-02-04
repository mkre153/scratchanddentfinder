import { defineConfig, defineCollection, s } from 'velite'

// Gate checklist schema for research briefs
// Adapted for B2C appliance shopping content
const gateChecklistSchema = s.object({
  single_question: s.boolean(),
  not_covered_elsewhere: s.boolean(),
  helpful_to_shoppers: s.boolean(),
  authoritative_sources: s.boolean(),
  no_brand_bias: s.boolean(),
})

const gateSchema = s.object({
  passed: s.boolean(),
  checked_by: s.string(),
  checked_at: s.string(),
  checklist: gateChecklistSchema,
})

// Research Brief collection
const briefs = defineCollection({
  name: 'Brief',
  pattern: 'briefs/*.md',
  schema: s.object({
    slug: s.string(),
    primaryQuestion: s.string(),
    targetReader: s.string(), // Who is this for?
    whyThisMatters: s.string().optional(),
    guideLink: s.string().default('/buyers-guide/'),
    stateLink: s.string().optional(), // Link to relevant state page
    gate: gateSchema,
    // Content
    content: s.markdown(),
    raw: s.raw(),
  }),
})

// SEO/AEO Schema Definitions
const faqSchema = s.object({
  q: s.string(),
  a: s.string(),
})

const tipSchema = s.object({
  tip: s.string(),
})

const takeawaysSchema = s.object({
  what: s.string(),
  tips: s.array(s.string()),
})

const keywordsSchema = s.object({
  primary: s.string(),
  secondary: s.array(s.string()).optional(),
})

// Blog Post collection
const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/*.mdx',
  schema: s.object({
    // Required fields
    title: s.string().max(70),
    description: s.string().max(160),
    slug: s.slug('posts'),
    brief: s.string(), // Reference to approved brief
    date: s.isodate(),
    updated: s.isodate(),
    category: s.enum([
      'buying-guides',
      'savings-tips',
      'product-guides',
      'shopping-strategies',
    ]),
    tags: s.array(s.string()),
    draft: s.boolean().default(false),
    canonical: s.literal('self'),
    guideLink: s.string().default('/buyers-guide/'),
    stateLink: s.string().optional(), // Link to relevant state page
    toc: s.boolean().default(false),
    // SEO/AEO fields
    keywords: keywordsSchema.optional(),
    takeaways: takeawaysSchema.optional(),
    faqs: s.array(faqSchema).optional(),
    // Computed fields
    readingTime: s.string().optional(),
    // Content - store raw for server-side MDX compilation
    body: s.raw(),
    raw: s.raw(),
  })
    // Custom validation: updated must be >= date
    .transform((data) => {
      const dateObj = new Date(data.date)
      const updatedObj = new Date(data.updated)
      if (updatedObj < dateObj) {
        throw new Error(`Post "${data.slug}": updated date must be >= date`)
      }
      // Calculate reading time (~200 wpm)
      const wordCount = data.raw.split(/\s+/).length
      const minutes = Math.ceil(wordCount / 200)
      return {
        ...data,
        readingTime: `${minutes} min read`,
      }
    }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { briefs, posts },
})
