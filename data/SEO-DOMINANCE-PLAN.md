# scratchanddentfinder.com — Strength Assessment & Action Plan

## Scoring: Weakest → Strongest

| # | Area | Score | Us | Competitor | Gap |
|---|------|-------|----|------------|-----|
| 1 | **Backlinks / External Authority** | 2/100 | 0 inbound links | Has indexed pages, likely has links | Critical |
| 2 | **Google Presence** | 3/100 | 0 indexed pages (submitted today) | Multiple pages indexed & ranking | Critical |
| 3 | **Domain Authority** | 5/100 | Brand new to Google | Established, trusted | Critical |
| 4 | **City Coverage** | 12/100 | 578 cities | 4,866 cities | Severe |
| 5 | **City Page Content Depth** | 15/100 | ~300 words/page | ~8,000 words/page | Severe |
| 6 | **Store Count** | 36/100 | 3,659 stores | 10,222 stores | Major |
| 7 | **Per-Page FAQ** | 0/100 | None (global FAQ only) | City-specific, 8-12 Q&As | Major |
| 8 | **Store Card Richness** | 40/100 | Open/closed badge only, no ratings shown | Full hours, ratings, all services | Moderate |
| 9 | **State Page Content** | 50/100 | ~500 words | ~800-1,200 words | Moderate |
| 10 | **Schema Completeness** | 60/100 | Org, WebSite, Breadcrumb, LocalBusiness, FAQPage, HowTo | + ItemList, OpeningHours | Moderate |
| 11 | **Internal Linking** | 60/100 | Breadcrumbs, nearby cities, rel="up" | + footer state links, store counts | Moderate |
| 12 | **Sitemap Completeness** | 70/100 | Missing FAQ, What Is, Buyer's Guide pages | Unknown | Minor |
| 13 | **Technical SEO** | 75/100 | ISR, SSR, canonicals, robots.txt. lastmod lies | Similar | Minor |
| 14 | **Informational Content** | 80/100 | FAQ (25 Q&As), What Is (2k words), Buyer's Guide wizard | Less depth | Advantage |
| 15 | **AEO / AI Optimization** | 85/100 | AI Summary on every page, quotable definitions | None | Advantage |
| 16 | **Interactive Tools** | 90/100 | Buyer's Guide wizard, Quick Deal Check | None | Advantage |
| 17 | **Code Architecture** | 95/100 | Clean gates, guardrails, ISR, typed | Unknown | Advantage |

---

## Plan: Fix Weakest First

### Priority 1 — Backlinks & External Authority (Score: 2/100)

Nothing else matters if Google doesn't trust us. Zero backlinks = zero authority = pages get "Crawled – not indexed."

#### 1A. Google Business Profile
- Create a GBP for "Scratch & Dent Finder" as an online directory service
- Links back to scratchanddentfinder.com
- Free, immediate, authoritative signal from Google's own property

#### 1B. Directory submissions (10-15 high-quality directories)
Target free, relevant directories that pass authority:
- **Yelp** — create business listing
- **Apple Maps Connect** — if applicable
- **Bing Places** — register site
- **BOTW (Best of the Web)** — directory submission
- **Jasmine Directory** — curated web directory
- **AboutUs.com** — business directory
- **Hotfrog** — business listing
- **Local.com** — local business directory

Each gives 1 backlink. Quality > quantity. No spammy PBNs.

#### 1C. Appliance industry outreach (5-10 targets)
Identify appliance blogs, consumer guides, and home improvement sites. Pitch:
- "We built a free directory of scratch & dent appliance stores — would you link to us as a resource?"
- Targets: home improvement blogs, frugal living sites, appliance review sites, consumer advice columns

**Sam's role:** Research targets, draft outreach emails, track responses via `gog` Gmail.

#### 1D. Local store outreach
Email stores in our directory: "You're listed on Scratch & Dent Finder — link to your listing from your website?"
- Each store that links back = a relevant, local backlink
- Template email via `himalaya` or `gog`
- Start with featured/verified stores

**Sam's role:** Draft template, send emails, track who links back.

#### 1E. Social profiles
Create profiles linking to site on:
- Facebook business page
- X/Twitter
- Pinterest (appliance/home content does well here)
- LinkedIn company page

Not high-authority but establishes web presence breadcrumbs that Google expects from a real business.

**Goal:** 20-30 backlinks within 30 days. Not gaming — legitimate presence-building.

---

### Priority 2 — Google Presence & Indexing (Score: 3/100)

Already started today. Continue the plan:

#### 2A. GSC indexing requests (in progress)
- Day 1 (done): Homepage
- Day 2: remaining content pages + top 5 states
- Day 3: more states + top cities
- Day 4-5: continue with high-store-count cities

#### 2B. Ping services
Submit sitemap URL to:
- Google: already done via GSC
- Bing Webmaster Tools: submit at bing.com/webmasters
- IndexNow: Bing's instant indexing protocol (can add to Next.js)

#### 2C. Social sharing for crawl signals
Share key pages on social profiles (1E above). Google discovers URLs through social crawling.
- Share homepage, top state pages, What Is page, FAQ
- Each share = a crawl signal

**Sam's role:** Schedule social posts, track which URLs get crawled first in GSC.

---

### Priority 3 — Domain Authority Building (Score: 5/100)

Authority builds over time. These accelerate it:

#### 3A. Consistent content freshness
Google rewards sites that update regularly. The ISR (5-min revalidation) helps, but Google also tracks when content meaningfully changes.
- As store ingestion adds stores, pages naturally update
- The sitemap `lastmod` should reflect real update times (not `new Date()`)

#### 3B. Fix sitemap lastmod
**File:** `app/sitemap.ts`

Currently all pages lie with `new Date()`. Options:
- Use `max(store.updatedAt)` per city/state if available in existing queries
- If not cheaply available, **omit lastmod entirely** rather than lying
- Static pages: use a fixed date, update only when content actually changes

#### 3C. Bing Webmaster Tools setup
Same process as GSC but for Bing. Submit sitemap. Bing shares data with other search engines.

**Sam's role:** Remind to set up Bing. Monitor both GSC and Bing for indexing progress.

---

### Priority 4 — City Coverage (Score: 12/100)

578 cities vs 4,866. We cover 12% of their footprint.

#### 4A. Audit city gap
- How many US cities with population > 25,000 are we missing?
- Which states have the thinnest coverage?
- Are there metro areas with stores but no city pages?

#### 4B. Accelerate store ingestion
**Reference:** `data/packs/DIRECTIVE-2026-01-16-BEGIN-INGESTION.md`

The ingestion pipeline already exists. Priority:
- Focus on top 50 metros by population (where search volume is highest)
- Then expand to all cities > 25,000 population
- Each ingested store automatically creates/populates city pages

#### 4C. Expand city database
If the database only has 1,004 cities, consider adding all US cities > 10,000 population to the `cities` table. Pages with 0 stores get noindex (already handled by `shouldIndexCity`), but they're ready to populate as stores are ingested.

**Sam's role:** Track ingestion progress, report on coverage gaps by state/metro.

---

### Priority 5 — City Page Content Depth (Score: 15/100)

~300 words vs ~8,000. But the fix isn't a word-count arms race — it's data-driven quality content.

#### Guardrails (from earlier review):
- **Uniqueness gate:** Components only render when 2+ city-specific data points exist
- **FAQ scaling:** 3 FAQs (<5 stores), 4-6 FAQs (5-14), 6-8 FAQs (15+)
- **No price claims:** No specific dollar amounts or savings percentages
- **Feature flag:** `NEXT_PUBLIC_ENABLE_CITY_ENRICHMENT` — ship disabled, enable after indexing traction
- **Performance:** Native `<details>` for collapsible sections, no heavy JS

#### 5A. City-specific FAQ component
**New file:** `components/directory/CityFAQ.tsx`

Data-gated FAQs using real aggregate data from stores array. Only questions where data backs the answer. Add `FAQPage` schema.

#### 5B. City buying guide
**New file:** `components/directory/CityBuyingGuide.tsx`

3-4 data-driven subsections. "How Pricing Typically Works" (no numbers). Delivery/installation stats from real data.

#### 5C. Expanded local context
**File:** `app/scratch-and-dent-appliances/[state]/[city]/page.tsx`

Expand from 2 sentences to 2-3 data-driven paragraphs (~150 words). Aggregated from stores array.

#### 5D. City-specific AI Summary
**File:** `components/marketing/AISummary.tsx`

Parameterize with city/state/storeCount to eliminate duplicate content across pages.

#### 5E. Integrate into city page
**File:** `app/scratch-and-dent-appliances/[state]/[city]/page.tsx`

Add new sections in order, behind feature flag + uniqueness gate.

**Target:** 1,200-2,500 words (small cities), 3,000-4,000 (metros). Quality over volume.

---

### Priority 6 — Store Count (Score: 36/100)

3,659 vs 10,222. Closing this gap feeds everything else (more cities, richer pages, better data signals).

#### 6A. Ingestion pipeline acceleration
The pipeline exists. Focus areas:
- Top 100 metros by population — ensure full coverage
- States with lowest store-per-city ratio
- Chains and franchise networks (one research effort → many stores)

#### 6B. Store submission funnel
`/store-submit/` page exists. Drive submissions:
- Email stores in under-covered areas
- Add "Is your store missing?" CTA to city pages with few results
- Incentivize with featured listing offers

**Sam's role:** Identify under-covered metros, draft outreach emails to stores, track submissions.

---

### Priority 7 — Per-Page FAQ (Score: 0/100)

Addressed by Priority 5A above. Depends on Phase B feature flag being enabled.

---

### Priority 8 — Store Card Richness (Score: 40/100)

#### 8A. Expand StoreCard display
**File:** `components/directory/StoreCard.tsx`

- **Full weekly hours:** Collapsible `<details>` element, no JS. Only if `store.hours` has data
- **Star ratings:** Show `store.rating` + `store.reviewCount` inline. Only if both exist
- **All appliance types:** Remove `.slice(0, 3)` limit
- **Installation badge:** Next to "Delivers" badge
- **Website link:** Add existing `WebsiteLink` component

---

### Priority 9 — State Page Content (Score: 50/100)

#### 9A. State-specific FAQ + buying guide
Same pattern as city pages — state-level FAQ (6-8 Q&As) with aggregate data across all cities. Add FAQPage schema.

#### 9B. City grid with store counts
**File:** `components/directory/CitySearchCard.tsx`

Add badge: "Los Angeles — 23 stores". Data in `city.storeCount`.

---

### Priority 10 — Schema Completeness (Score: 60/100)

#### 10A. ItemList schema on city pages
**File:** `lib/schema.tsx`

New `generateItemListSchema()` — wraps LocalBusiness items in ItemList with position numbering.

#### 10B. OpeningHoursSpecification in LocalBusiness
**File:** `lib/schema.tsx`

Add to `generateLocalBusinessSchema()` when `store.hours` exists.

#### 10C. ItemList schema on state pages
List of cities as ItemList entries.

---

### Priority 11 — Internal Linking (Score: 60/100)

#### 11A. Footer Resources column (Phase A2)
Already in Phase A. Links to FAQ, What Is, Buyer's Guide from every page.

#### 11B. Nearby cities with store counts (Phase A3)
Already in Phase A.

#### 11C. Cross-link content pages to city pages
FAQ and What Is pages should link contextually to "find stores in your area" with actual city page links.

---

### Priority 12 — Sitemap Completeness (Score: 70/100)

#### 12A. Add missing content pages (Phase A1)
Already in Phase A. Add FAQ, What Is, Buyer's Guide to sitemap.

---

### Priority 13 — Technical SEO (Score: 75/100)

#### 13A. Fix lastmod (Priority 3B above)
#### 13B. Enhanced meta descriptions
**File:** `lib/seo.ts`

Vary city meta descriptions using available data (appliance types, delivery, ratings).

#### 13C. Sitemap index
Split via `generateSitemaps()` as URL count grows past 1,000.

---

### Priorities 14-17 — Our Advantages (80-95/100)

These are already strong. Maintain, don't over-invest:
- **Informational content** (80) — FAQ, What Is, Buyer's Guide are solid
- **AEO** (85) — AI Summary is unique advantage, fix duplicate content (5D)
- **Interactive tools** (90) — Buyer's Guide wizard is a differentiator
- **Code architecture** (95) — gates, guardrails, ISR all working

---

## Sam's Role: SEO/AEO Web Presence Consultant

### Commands Sam should support:
- `/seo status` — overall score card, what's been done, what's next
- `/seo backlinks` — track backlink acquisition progress
- `/seo coverage` — report on city/store coverage gaps
- `/seo indexing` — check GSC indexing status (if API enabled)
- `/seo outreach` — manage store/blogger outreach campaigns
- `/seo competitor` — check competitor changes

### Cron jobs:
- **Daily:** Check if sitemap is accessible, count URLs
- **Weekly:** Compile progress report (backlinks acquired, stores added, cities covered, pages indexed)

### What Sam tracks:
- Backlink acquisition list (target → status → date)
- Store ingestion progress (stores/week, cities covered)
- GSC indexing milestones
- Competitor monitoring

---

## Execution Order Summary

| Order | Priority | Score | What | Who |
|-------|----------|-------|------|-----|
| NOW | P1 | 2/100 | Backlinks — directory submissions, social profiles, outreach | Sam + Mike |
| NOW | P2 | 3/100 | Indexing — continue GSC requests, Bing setup | Mike (manual) |
| NOW | P12 | 70/100 | Sitemap — add missing pages (Phase A, quick code change) | Claude Code |
| NOW | P11 | 60/100 | Footer links (Phase A, quick code change) | Claude Code |
| WEEK 1 | P3 | 5/100 | Authority — fix lastmod, social sharing, freshness | Claude Code + Sam |
| WEEK 1 | P4 | 12/100 | City coverage — audit gaps, prioritize ingestion targets | Sam + Claude Code |
| WEEK 2+ | P6 | 36/100 | Store ingestion — accelerate pipeline for top metros | Sam + Mike |
| AFTER INDEXING | P5 | 15/100 | City content depth — FAQ, buying guide, expanded context | Claude Code |
| AFTER INDEXING | P8 | 40/100 | Store cards — hours, ratings, appliances, website link | Claude Code |
| AFTER INDEXING | P10 | 60/100 | Schema — ItemList, OpeningHours | Claude Code |
| LATER | P9 | 50/100 | State pages — FAQ, buying guide, city counts | Claude Code |
| LATER | P13 | 75/100 | Technical — meta descriptions, sitemap index | Claude Code |

---

## Files to Modify

| File | Priority | Changes |
|------|----------|---------|
| `app/sitemap.ts` | P3, P12 | Add missing pages, fix lastmod |
| `components/layout/Footer.tsx` | P11 | Add Resources column |
| `components/directory/NearbyCities.tsx` | P11 | Add store counts |
| `components/directory/StoreCard.tsx` | P8 | Hours, ratings, appliances, install badge, website |
| `app/scratch-and-dent-appliances/[state]/[city]/page.tsx` | P5 | FAQ, buying guide, expanded context, feature flag |
| `components/marketing/AISummary.tsx` | P5 | City-specific content |
| `lib/schema.tsx` | P10 | ItemList, OpeningHoursSpecification |
| `lib/seo.ts` | P13 | Enhanced meta descriptions |

## New Files

| File | Priority | Purpose |
|------|----------|---------|
| `components/directory/CityFAQ.tsx` | P5 | Data-gated, scaled FAQ |
| `components/directory/CityBuyingGuide.tsx` | P5 | Data-driven buying guide |

## Verification

After each code change:
1. `npm run build` — no errors
2. Verify on production
3. Rich Results Test for schema changes
4. Monitor GSC for crawl errors
