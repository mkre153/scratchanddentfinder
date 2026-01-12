# Listing Pages Decision

**Decision:** Listings do NOT get individual public URLs.
**Locked:** 2026-01-12

---

## Rationale

1. **Target site behavior** - scratchanddentlocator.com shows store cards only on city pages
2. **City aggregation is the ranking surface** - "scratch and dent appliances in [city]" is the SEO target
3. **Avoids premature SEO surface explosion** - fewer pages = higher quality signals
4. **Keeps monetization optional** - featured placement works without dedicated pages
5. **Lower operational cost** - no per-listing maintenance burden

---

## Store Data Model

Stores exist as data objects with stable IDs for:
- Deduplication (place_id is primary key)
- Featured status tracking
- Analytics attribution
- Payment/subscription linking

Stores are rendered as cards within city pages only.

---

## Enforcement

- Gate 1 (`gateNoStoreRoutes()`) enforces this at build time
- Any `/store/[slug]` or `/listing/[slug]` route will fail the gate
- Exception: `/stores/new/` is allowed (submission form, not detail page)
