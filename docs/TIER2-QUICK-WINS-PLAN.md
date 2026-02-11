# SDF Tier 2 Quick Wins Implementation Plan

*Created: 2026-02-11*
*Source: Competitive audit (Feb 2026) against Yale Appliance, Consumer Reports, Wirecutter, AJ Madison*

## Status: Planned

## Items

### Item 8: Enable Quick Assess Widget (~5 min)
- **Status:** Not started
- **Current state:** Component fully built (392 lines), feature-flagged OFF
- **Fix:** Add `NEXT_PUBLIC_ENABLE_QUICK_ASSESS_WIDGET="true"` to `.env.production` and Vercel env vars
- **Files:** `.env.production`

### Item 9: Verify City Enrichment (~5 min)
- **Status:** Not started
- **Current state:** Already `"true"` in `.env.production` (line 5)
- **Action:** Verify CityFAQ and CityBuyingGuide render on city pages with 2+ stores
- **No code changes needed**

### Item 6: Scale Blog Content to 20 Posts
- **Status:** Not started
- **Current state:** 5 blog posts in `content/blog/`, 4 briefs in `content/briefs/`
- **Pipeline:** Each post needs brief in `content/briefs/[slug].md` + post in `content/blog/[slug].mdx`
- **Schema rules:** title max 70 chars, description max 160 chars, category enum (buying-guides, savings-tips, product-guides, shopping-strategies), canonical must be 'self'
- **MDX components:** `<Callout>`, `<BuyerChecklist>`, `<ComparisonTable>`, `<FAQSection>`, `<Figure>`, `<PriceComparison>`, `<YouTubeEmbed>`
- **Approach:** 15 new posts using "They Ask, You Answer" format, 800-1500 words each

#### Topic List (15 new posts)
| # | Title | Category |
|---|-------|----------|
| 1 | Can You Return Scratch and Dent Appliances? | buying-guides |
| 2 | Scratch and Dent vs Open Box: What's the Difference? | buying-guides |
| 3 | Are Scratch and Dent Appliances Safe? | buying-guides |
| 4 | How Much Can You Save on Scratch and Dent Appliances? | savings-tips |
| 5 | Best Scratch and Dent Deals by Season | shopping-strategies |
| 6 | Scratch and Dent Refrigerators: What to Know Before Buying | product-guides |
| 7 | Scratch and Dent Washers and Dryers: Buying Guide | product-guides |
| 8 | Do Scratch and Dent Appliances Come with a Warranty? | buying-guides |
| 9 | How to Negotiate Scratch and Dent Prices Like a Pro | shopping-strategies |
| 10 | Scratch and Dent Dishwashers: Are They Worth It? | product-guides |
| 11 | What Stores Sell Scratch and Dent Appliances? | shopping-strategies |
| 12 | Scratch and Dent Ranges and Ovens: Buying Guide | product-guides |
| 13 | Should You Buy Scratch and Dent for a Rental Property? | savings-tips |
| 14 | First-Time Buyer's Guide to Scratch and Dent Shopping | buying-guides |
| 15 | Hidden Costs of Scratch and Dent Appliances | savings-tips |

### Item 7: Build Email Newsletter Infrastructure
- **Status:** Not started
- **Current state:** `email_subscribers` table exists, `/api/subscribe` captures emails, Resend API key active, no send logic
- **Files to create:**
  - `lib/email/templates/newsletter.tsx` — React/Resend template
  - `app/api/email/newsletter/route.ts` — POST endpoint (batch send via Resend, admin auth)
  - `app/api/unsubscribe/route.ts` — unsubscribe handler
- **Requirements:** Fetches subscribers from Supabase, latest blog posts from Velite, sends via Resend batch API

### Item 10: Audio Narration with OpenAI TTS
- **Status:** Not started
- **Current state:** No audio features exist
- **Files to create:**
  - `scripts/generate-audio.mjs` — reads blog posts, calls OpenAI TTS API (tts-1, voice alloy), saves MP3s to `public/audio/[slug].mp3`
  - `components/blog/AudioPlayer.tsx` — client component with play/pause, progress, speed control
- **Files to modify:**
  - `app/blog/[slug]/page.tsx` — add AudioPlayer
  - `velite.config.ts` — optional audio field

## Execution Order
1. Item 8 + 9 (feature flags)
2. Item 6 (blog content in batches of 5)
3. Item 10 (audio narration)
4. Item 7 (newsletter infrastructure)
5. Build verify, commit, deploy

## Verification Checklist
- [ ] `next build` passes clean with all 20 posts
- [ ] Quick Assess Widget renders on city pages
- [ ] CityFAQ/CityBuyingGuide render on city pages with stores
- [ ] Audio player appears on blog posts with generated MP3s
- [ ] Newsletter API route sends test email
- [ ] Unsubscribe link works
