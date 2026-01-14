# Return Point: Scratch and Dent Finder

**Created:** 2026-01-13
**Branch:** main (11 commits ahead of origin)
**Last Commit:** c5d9220 - Slice 10 + 11: Operator Control + Hardening Guardrails

---

## Completed Slices (0-11)

| Slice | Name | Status |
|-------|------|--------|
| 0 | Apify Import Pipeline | ✅ Complete |
| 1-9 | Engine Parity | ✅ Complete |
| 10 | Operator Control + Monetization Readiness | ✅ Complete |
| 11 | Hardening Guardrails | ✅ Complete |

---

## What Slice 10+11 Added

- **Database:** `store_claims`, `cta_events`, `cta_rate_limits`, `admin_users` tables
- **Admin UI:** `/admin/claims/`, `/admin/stores/` (tier + exposure management)
- **CTA Persistence:** Events tracked to DB with durable Postgres rate limiting
- **Verification Scripts:** `scripts/seo-verify.ts`, `scripts/routes-inventory.ts`
- **Operator Runbook:** `docs/OPERATOR_RUNBOOK.md` with "Never Do" section

---

## Key Principles Established

1. **Tier ≠ Exposure** - `setStoreTier()` does NOT flip `is_featured`
2. **One approved claim per store** - Enforced at DB level
3. **Rate limiting is durable** - Postgres-based, survives deploys
4. **SEO surface must be verified** - Run `seo-verify.ts --compare local,prod` before deploys

---

## Migration Pending

```bash
supabase db push  # Apply 0004_operator_control.sql and 0005_hardening.sql
```

---

## Verification Commands

```bash
npm run build                           # Build passes
npm run gates                           # 16/16 gates pass
npx tsx scripts/routes-inventory.ts     # Routes classified correctly
npx tsx scripts/seo-verify.ts           # SEO verification (needs dev server)
```

---

## Next Steps (Not Started)

**Per plan:** STOP. Report. Re-evaluate exposure strategy.

Options after this point:
- Presentation parity (Homepage, Footer, Schema)
- SEO surface expansion
- Stripe integration for monetization

---

## Quick Context for New Session

This is a **Next.js 14 directory site** for scratch & dent appliance stores.

**Key files to know:**
- `lib/urls.ts` - Single source of truth for all URLs (Gate 5)
- `lib/queries.ts` - Data access layer (Gate 7)
- `lib/supabase/admin.ts` - Only Supabase import point
- `docs/OPERATOR_RUNBOOK.md` - Operational procedures
- `docs/GATES/` - Quality gate definitions

**Architecture pattern:** Factory boundaries + centralized URL generation + parity mode with scratchanddentlocator.com
