# Return Point: Scratch and Dent Finder

**Updated:** 2026-02-01  
**Branch:** main  
**Status:** ✅ PRODUCTION LIVE

---

## Current State (2026-02-01)

### Production Data

- **50 states** covered
- **578 cities** with listings
- **3,659 stores** in database

### Completed

- All 17 gates passing
- Auth, billing, directory structure
- FAQ page + schema (`/faq/`)
- "What is Scratch and Dent" definition page (`/what-is-scratch-and-dent/`)
- llms.txt for AI crawlers
- Vercel env vars fixed

### Remaining Growth Tasks

- Fill 7 empty states (DE, ME, MT, NH, VT, WV, WY)
- Expand to 138 additional cities per `DATA_MINER_DIRECTIVE.md`
- These are **growth tasks, not blockers** — the site is live and populated

---

## Key Architecture

```
lib/ingestion/index.ts    ← ALL data enters here (Gate 16)
lib/queries.ts            ← ALL reads go here (Gate 7)
lib/urls.ts               ← ALL URLs generated here (Gate 5)
lib/schema.tsx            ← JSON-LD schema generators
lib/seo.ts                ← Metadata generators
lib/supabase/admin.ts     ← Server-side Supabase client
```

### Database Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `states` | 50 US states | 50 |
| `cities` | City entries | 578 |
| `stores` | Directory listings | 3,659 |
| `subscriptions` | Stripe subscription state | — |
| `stripe_webhook_events` | Idempotency tracking | — |

---

## Recent Additions (2026-02-01)

### FAQ Page
- Route: `/faq/`
- 15 FAQs in 5 categories
- FAQPage schema for rich snippets
- File: `app/faq/page.tsx`

### Definition Page
- Route: `/what-is-scratch-and-dent/`
- AI-quotable content (AEO optimized)
- Comparison table: scratch & dent vs refurbished vs used vs open box
- File: `app/what-is-scratch-and-dent/page.tsx`

### Supporting Files
- `lib/urls.ts` — added `getFaqUrl()`, `getWhatIsScratchAndDentUrl()`
- `lib/seo.ts` — metadata generators for both pages

---

## Stripe Integration

- **Checkout:** `/api/checkout` → Stripe hosted checkout
- **Webhooks:** `/api/webhooks/stripe` → Handles all lifecycle events
- **Billing Portal:** `/api/billing-portal` → Customer self-service
- **Featured Status:** `is_featured` + `featured_until` (deterministic)

---

## Schema Markup

**Site-wide:**
- Organization schema
- WebSite schema

**Page-specific:**
- BreadcrumbList (state/city pages)
- LocalBusiness (per store on city pages)
- FAQPage (FAQ, definition page, buyer's guide)

---

## Quick Commands

```bash
# Development
npm run dev

# Build + verify
npm run build && npm run gates

# Push to remote
git push origin main
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/ingestion/index.ts` | Ingestion boundary |
| `lib/schema.tsx` | JSON-LD schema generators |
| `lib/urls.ts` | URL generation (single source of truth) |
| `lib/seo.ts` | Metadata generators |
| `docs/SEO-AEO-STRUCTURE.md` | SEO/AEO guidelines |
| `DATA_MINER_DIRECTIVE.md` | Data expansion directive |

---

## Future Growth Opportunities

- Add HowTo schema to homepage "How It Works" section
- Blog/content expansion
- Featured store promotions
- Agent submissions growth

---

*Updated 2026-02-01 — Site is live with 3,659 stores across 578 cities*
