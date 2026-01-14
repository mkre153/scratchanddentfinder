# Return Point: Scratch and Dent Finder

**Updated:** 2026-01-14
**Branch:** main
**Last Commit:** c29a1f9 - chore: remove Apify ingestion adapter (ADR-00X)

---

## Current State: READY FOR DATA

The application is **production-ready** and waiting for store data from external data miner.

### What's Complete

| Phase | Status |
|-------|--------|
| Core Directory (Slices 1-9) | ✅ Complete |
| Operator Control (Slice 10) | ✅ Complete |
| Hardening Guardrails (Slice 11) | ✅ Complete |
| Auth + User Accounts | ✅ Complete |
| Stripe Billing Integration | ✅ Complete |
| Pre-Deploy Efficiency Audit | ✅ Complete |
| Apify Removal (ADR-00X) | ✅ Complete |

### What's Waiting

| Item | Blocker |
|------|---------|
| Store data population | External data miner |
| Production deploy | Store data |

---

## When You Return With Data

### Expected CSV Format

Your external data miner should produce a CSV with these columns:

```csv
name,address,city,state_code,zip,phone,website,lat,lng
"Bob's Appliances","123 Main St","Austin","TX","78701","512-555-1234","https://example.com",30.2672,-97.7431
```

**Required fields:** name, city, state_code
**Optional fields:** address, zip, phone, website, lat, lng

### Ingestion Path

1. Place CSV in `data/` directory
2. Create ingestion script that uses `lib/ingestion/index.ts`:
   - `ensureCity()` — Creates city if not exists
   - `logIngestion()` — Audit trail
3. Insert stores via Supabase admin client with `is_verified: true`

### Key Constraint (ADR-00X)

> **NO scraping code in this repo.** All data must be pre-normalized externally.
> Gate 12 enforces this at build time.

---

## Verification Before Deploy

```bash
npm run build                           # Must pass
npm run gates                           # Target: 17/17 (currently 15/17)
```

### Known Gate Failures (Pre-existing)

| Gate | Issue | Priority |
|------|-------|----------|
| Gate 7 | Auth components import createClient directly | Low (auth works) |
| Gate 11 | Query ordering verification regex | Low (ordering is correct) |

These are verification strictness issues, not functional bugs.

---

## Key Architecture

```
lib/ingestion/index.ts    ← ALL data enters here (Gate 16)
lib/queries.ts            ← ALL reads go here (Gate 7)
lib/urls.ts               ← ALL URLs generated here (Gate 5)
lib/supabase/admin.ts     ← Server-side Supabase client
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `states` | 50 US states (pre-seeded) |
| `cities` | Created on-demand via `ensureCity()` |
| `stores` | Directory listings |
| `subscriptions` | Stripe subscription state |
| `stripe_webhook_events` | Idempotency tracking |

---

## Stripe Integration (Already Working)

- **Checkout:** `/api/checkout` → Stripe hosted checkout
- **Webhooks:** `/api/webhooks/stripe` → Handles all lifecycle events
- **Billing Portal:** `/api/billing-portal` → Customer self-service
- **Featured Status:** `is_featured` + `featured_until` (deterministic)

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

## Resume Checklist

When you return with data:

- [ ] CSV formatted correctly
- [ ] Create `scripts/import-csv.ts` using ingestion boundary
- [ ] Run import against staging first
- [ ] Verify city pages populate
- [ ] Run full build + gates
- [ ] Deploy to production

---

## Files to Know

| File | Purpose |
|------|---------|
| `lib/ingestion/index.ts` | Ingestion boundary — start here for imports |
| `lib/ingestion/submissions.ts` | User submission approval flow |
| `docs/OPERATOR_RUNBOOK.md` | Operational procedures |
| `scripts/gates-verify.ts` | Quality gate enforcement |
| `supabase/migrations/` | Database schema |

---

*Last updated by Claude before data miner setup*
