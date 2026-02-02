# Return Point: Scratch and Dent Finder

**Updated:** 2026-02-01
**Branch:** main
**Status:** ✅ LIVE WITH DATA

---

## Current State: PRODUCTION LIVE

The application is **live and populated** at [scratchanddentfinder.com](https://scratchanddentfinder.com).

### Live Stats (as of 2026-02-01)

| Metric | Count |
|--------|-------|
| States | 50 |
| Cities | 578 |
| Stores | 3,659 |

California alone: 678 stores across 119 cities.

### What's Complete

| Phase | Status |
|-------|--------|
| Core Directory (Slices 1-9) | ✅ Complete |
| Operator Control (Slice 10) | ✅ Complete |
| Hardening Guardrails (Slice 11) | ✅ Complete |
| Auth + User Accounts | ✅ Complete |
| Stripe Billing Integration | ✅ Complete |
| Pre-Deploy Efficiency Audit | ✅ Complete |
| Store Data Import | ✅ Complete |
| Production Deploy | ✅ Live |
| FAQ Page (`/faq/`) | ✅ Complete |
| Definition Page (`/what-is-scratch-and-dent/`) | ✅ Complete |

---

## Recent Additions (2026-02-01)

### A) FAQ Page
- Route: `/faq/`
- 15 FAQs organized in 5 categories
- FAQPage schema for rich snippets
- Files: `app/faq/page.tsx`

### B) Definition Page  
- Route: `/what-is-scratch-and-dent/`
- AI-quotable definition content (AEO optimized)
- Comparison table: scratch & dent vs refurbished vs used vs open box
- FAQPage schema for key definition questions
- Files: `app/what-is-scratch-and-dent/page.tsx`

### Supporting Changes
- `lib/urls.ts` — added `getFaqUrl()`, `getWhatIsScratchAndDentUrl()`
- `lib/seo.ts` — added metadata generators for both pages

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

## Stripe Integration (Working)

- **Checkout:** `/api/checkout` → Stripe hosted checkout
- **Webhooks:** `/api/webhooks/stripe` → Handles all lifecycle events
- **Billing Portal:** `/api/billing-portal` → Customer self-service
- **Featured Status:** `is_featured` + `featured_until` (deterministic)

---

## Schema Markup

Site-wide:
- Organization schema
- WebSite schema

Page-specific:
- BreadcrumbList (state/city pages)
- LocalBusiness (per store on city pages)
- FAQPage (FAQ page, definition page, buyer's guide)

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

## Files to Know

| File | Purpose |
|------|---------|
| `lib/ingestion/index.ts` | Ingestion boundary |
| `lib/schema.tsx` | JSON-LD schema generators |
| `lib/urls.ts` | URL generation (single source of truth) |
| `lib/seo.ts` | Metadata generators |
| `docs/SEO-AEO-STRUCTURE.md` | SEO/AEO guidelines |
| `scripts/gates-verify.ts` | Quality gate enforcement |

---

## Next Opportunities

- [ ] Add HowTo schema to homepage "How It Works" section
- [ ] Blog/content expansion
- [ ] Featured store promotions
- [ ] Agent submissions growth

---

*Updated 2026-02-01 — Site is live with 3,659 stores*
