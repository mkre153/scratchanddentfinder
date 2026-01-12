# Architecture Gate 1: Listing URL Decision

**Decision:** GUIDE-FIRST
**Locked:** 2026-01-12

---

## 7-Step Decision Rubric

| Step | Question | Answer | Justification |
|------|----------|--------|---------------|
| 1. Unit of Trust | Provider or city guide? | **City guide** | Users want "where can I shop for deals" not "should I trust this specific store" |
| 2. Narrative Uniqueness | 800+ words per listing? | **NO** | Stores differ only by name, address, hours, appliance types - no unique story |
| 3. Intent Depth | "Which one" or "where to go"? | **"Where to go"** | Shallow discovery - find nearby options, compare on price/selection |
| 4. SEO Document | Rank listings or city page? | **City page** | Aggregation IS the value - "scratch and dent appliances in [city]" |
| 5. Monetization | Lead-gen or visibility? | **Visibility/placement** | Featured listings, not lead capture forms |
| 6. Operational Cost | Maintain per-listing pages? | **NO** | Organic growth model, low maintenance tolerance |
| 7. Regulatory Risk | Medical/legal/financial? | **NO** | Appliance retail is low-risk |

---

## Decision

```
This project is GUIDE-FIRST.
Listings will be rendered inline and will NOT have dedicated URLs.
```

---

## Architectural Consequences

### ALLOWED ROUTES
```
/
/scratch-and-dent-appliances/
/scratch-and-dent-appliances/[state]/
/scratch-and-dent-appliances/[state]/[city]/
/about/
/contact/
/advertise-with-us/
/stores/new/
/dashboard/
/dashboard/billing/
/api/leads/
/api/webhooks/stripe/
/sitemap.xml
/robots.txt
```

### FORBIDDEN ROUTES (INVARIANT)
```
/store/[slug]
/stores/[slug]
/listing/[slug]
/listings/[slug]
Any individual store detail page
```

---

## Future Revisit Conditions

This decision may be revisited ONLY if ALL conditions are met:
- ≥1,000 stores in database
- Proven organic traffic (≥10k monthly sessions)
- Clear conversion lift case documented
- Business justification approved

**Until then: NO STORE ROUTES.**
