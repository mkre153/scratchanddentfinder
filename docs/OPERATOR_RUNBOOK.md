# Operator Runbook

> Scratch and Dent Finder - Operational Policy
> Last updated: 2026-01-13

This document defines operational policies for managing the directory. It covers claim approval, tier assignment, exposure control, and monitoring. The "Never Do" section at the end lists explicit prohibitions that must be followed regardless of circumstances.

---

## Claim Approval Checklist

Before approving a store ownership claim:

- [ ] **Verify business ownership** - Confirm claimant has legitimate connection to the business
  - Phone verification: Call the store's listed number, speak to someone who can confirm
  - Email verification: Send email to business domain (not Gmail/Yahoo)
  - Document the verification method in the claim notes field

- [ ] **Check for existing approved claim** - Only one approved claim per store
  - Query: `SELECT * FROM store_claims WHERE store_id = X AND status = 'approved'`
  - If exists, reject the new claim or investigate ownership transfer

- [ ] **Confirm store exists in directory**
  - Store must be in `stores` table with `is_approved = true`
  - Verify the store details match the claim

- [ ] **Document verification method**
  - Always fill the `notes` field with how you verified
  - Example: "Verified via phone call to store, spoke with owner John Doe on 2026-01-13"

---

## Tier Assignment Policy

Tiers represent monetization status (payment confirmed). They do NOT control SEO visibility.

- [ ] **Payment confirmed** - When Stripe is integrated, verify payment before tier assignment
  - Check Stripe dashboard for successful payment
  - Match customer email to store owner email

- [ ] **Set appropriate tier**
  - `monthly` - 30-day subscription
  - `annual` - 365-day subscription
  - `lifetime` - Permanent (no expiration)

- [ ] **Set featured_until date**
  - For monthly: current date + 30 days
  - For annual: current date + 365 days
  - For lifetime: NULL (no expiration)

- [ ] **DO NOT flip is_featured**
  - Tier assignment does NOT grant SEO visibility
  - Exposure requires separate, manual quality gate

---

## Exposure Toggle Policy

Exposure (`is_featured`) controls SEO visibility. Separate from tier.

Before enabling exposure for a store:

- [ ] **Quality gate passed**
  - Store has description (not empty)
  - Store has hours (at least some days filled)
  - Store has phone number
  - Store address is complete

- [ ] **Run SEO verification**
  - `npx tsx scripts/seo-verify.ts`
  - Confirm no regressions before enabling

- [ ] **Verify tier is active** (optional but recommended)
  - Exposure without tier is allowed but unusual
  - Document reason if exposing without tier

---

## Metrics to Check

Monitor these metrics regularly for abuse detection:

### CTA Events Volume

```sql
-- Events per store per day
SELECT store_id, DATE(created_at), COUNT(*)
FROM cta_events
GROUP BY store_id, DATE(created_at)
ORDER BY COUNT(*) DESC;
```

- **Normal**: 10-100 events/day per popular store
- **Suspicious**: >500 events/day from single store
- **Action**: Investigate source_page patterns, check rate_limits table

### Claim Rate

```sql
-- Claims per day
SELECT DATE(created_at), COUNT(*)
FROM store_claims
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;
```

- **Normal**: 0-5 claims/day
- **Suspicious**: >10 claims/day or multiple claims for same store
- **Action**: Review claim details, check for gaming

### Rate Limit Hits

```sql
-- IPs hitting rate limits
SELECT ip_hash, SUM(event_count) as total, COUNT(*) as windows
FROM cta_rate_limits
WHERE window_start > NOW() - INTERVAL '1 day'
GROUP BY ip_hash
ORDER BY total DESC
LIMIT 20;
```

- **Normal**: Most IPs under 100 events/day
- **Suspicious**: IPs with thousands of events
- **Action**: Check if legitimate traffic or abuse

---

## Routine Maintenance

### Rate Limit Cleanup (Weekly)

```sql
-- Clean up rate limit records older than 24 hours
SELECT cleanup_cta_rate_limits(1440);
```

### Expired Tiers Check (Weekly)

```sql
-- Find stores with expired tiers still marked as featured
SELECT id, name, featured_tier, featured_until, is_featured
FROM stores
WHERE featured_until < NOW()
  AND is_featured = true;
```

- **Action**: Disable exposure for expired stores

---

## NEVER DO (Explicit Prohibitions)

These actions are prohibited regardless of circumstances. Violating these rules risks data integrity, SEO damage, or audit trail corruption.

### 1. Never auto-enable exposure from tier assignment

```
Tier and exposure are decoupled by design. Paying for a tier does not
automatically grant SEO visibility. Exposure requires manual quality gate.

WHY: Prevents untested stores from appearing in search results.
     Protects SEO reputation from low-quality listings.
```

### 2. Never approve claims without verification

```
Every claim must have documented verification. "Looks legitimate" is not
verification. Phone call or email confirmation required.

WHY: Prevents fraudulent ownership claims.
     Protects legitimate store owners from impersonation.
```

### 3. Never deploy SEO changes without running verification

```
Before any deploy that touches routes, metadata, or sitemap:
1. Run `npx tsx scripts/seo-verify.ts --compare local,prod`
2. Run `npx tsx scripts/routes-inventory.ts`
3. Confirm gates 0-15 pass

WHY: Prevents accidental canonical/URL changes.
     Catches CDN/environment drift before production.
```

### 4. Never skip gates before merge

```
All PRs must pass gates. "I'll fix it after merge" is not acceptable.
Gates exist to prevent irreversible mistakes.

WHY: Gates catch issues before they reach production.
     Post-merge fixes may not be possible for SEO damage.
```

### 5. Never modify stores.claimed_by directly

```
This field is derived from approved claims via trigger. Direct modification
breaks the audit trail. Always use the claim approval workflow.

WHY: Preserves audit trail for ownership.
     Ensures trigger logic runs for data consistency.
```

### 6. Never delete rate limit records manually

```
Rate limits exist for monetization integrity. Manual deletion enables
gaming. Use the cleanup function with appropriate retention.

WHY: Prevents inflated analytics from abuse.
     Maintains integrity of CTA event data.
```

### 7. Never expose stores without quality gate

```
Even if tier is assigned, do not flip is_featured until quality gate passes:
- Description present
- Hours present
- Phone present

WHY: Protects SEO reputation from incomplete listings.
     Ensures user experience quality.
```

### 8. Never bypass admin auth checks

```
All admin routes have role-based auth. Do not add bypass logic,
even for "just testing" or "one-time operations."

WHY: Prevents unauthorized access to admin functions.
     Maintains security posture.
```

---

## Emergency Procedures

### SEO Emergency (Canonical/URL Issues)

1. **Stop deployment** - Prevent further damage
2. **Run verification** - `npx tsx scripts/seo-verify.ts --compare local,prod`
3. **Identify drift** - Note which pages have mismatches
4. **Revert if needed** - Roll back to last known good state
5. **Document incident** - Record what happened and why

### Rate Limit Abuse

1. **Identify IP** - Check `cta_rate_limits` for high-volume IPs
2. **Verify abuse** - Check if legitimate traffic or gaming
3. **If abuse**: Rate limiting will auto-block (no action needed)
4. **If persistent**: Consider adding IP to blocklist at infrastructure level

### Claim Dispute

1. **Do not approve new claim** - Keep both claims in pending state
2. **Gather evidence** - Request documentation from both parties
3. **Escalate if needed** - Consult legal/support for resolution
4. **Document decision** - Record reasoning in claim notes

---

## Contacts

- **Technical Issues**: [TBD - Engineering contact]
- **Business/Legal**: [TBD - Business contact]
- **SEO Emergency**: [TBD - SEO specialist contact]
