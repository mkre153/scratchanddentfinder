# Marketing Surface Gate (MSG)

## Gate Type
**Surface Isolation Gate**

## Applies To
Any slice that introduces:
- `/about`
- `/contact`
- `/pricing`
- `/advertise`
- `/careers`
- `/legal`
- Any non-directory, non-transactional informational page

## Purpose

To guarantee that marketing pages are **read-only**, **non-authoritative**, and **non-participatory** in the product's trust, SEO, and data pipelines.

This gate exists to answer one question:

> "Can we safely add content without accidentally changing the product?"

---

## Core Principle

**Marketing surfaces observe the system — they do not influence it.**

- No writes
- No discovery
- No trust elevation
- No sitemap authority
- No behavioral coupling

---

## Hard Constraints (Non-Negotiable)

### 1. Read-Only Enforcement

Marketing pages **MUST NOT**:
- Write to the database
- Call mutation functions
- Submit forms to backend routes
- Trigger workflows, queues, or webhooks

**Allowed:** Derived reads from already-approved data
**Forbidden:** Any mutation or submission path

### 2. Server Components Only

Marketing pages **MUST**:
- Be server components
- NOT use `'use client'`

This prevents:
- Client-side state leaks
- Accidental analytics hooks
- Future mutation creep

### 3. No Trust Surface Access

Marketing pages **MUST NOT**:
- Import `store_submissions`
- Import approval/rejection functions
- Reference untrusted data types

They may only observe:
- Approved, public data
- Aggregated or derived counts

### 4. Sitemap Exclusion by Default

Marketing pages:
- **MUST NOT** appear in `sitemap.xml`
- **MUST NOT** affect sitemap completeness math

**Rationale:**
- Sitemap is a directory contract, not a content index
- Marketing pages are discoverable via internal links, not crawlers

(Exception allowed only via explicit override gate)

### 5. No New Adapters

Marketing pages **MUST**:
- Use existing query helpers
- NOT introduce new adapters
- NOT bypass adapter boundaries

### 6. No Dynamic Caching Overrides

Marketing pages **MUST NOT**:
- Use `force-dynamic`
- Use custom revalidation rules
- Use ISR tricks

Default caching only.

---

## Allowed Data Pattern

Marketing pages **MAY**:
- Call existing read queries
- Derive stats via `reduce()`
- Display counts that are provably true

### Example (Allowed)

```typescript
const states = await getAllStates()

const stats = {
  totalStates: states.length,
  totalCities: states.reduce((sum, s) => sum + s.cityCount, 0),
  totalStores: states.reduce((sum, s) => sum + s.storeCount, 0),
}
```

### Forbidden

- Hardcoded claims
- Marketing-only tables
- "Estimated" numbers
- Analytics-derived stats

---

## Verification Rules

### Static Analysis

The gate must verify:

**No marketing page:**
- Imports mutation functions
- References untrusted tables
- Uses `'use client'`

**Sitemap:**
- Does not include marketing routes

**Queries:**
- Come only from approved query helpers

---

## Exit Criteria

The Marketing Surface Gate passes only if:

- [ ] Marketing pages render correctly
- [ ] All existing gates remain green
- [ ] No new backend surfaces exist
- [ ] Sitemap behavior is unchanged
- [ ] Trust isolation remains provable

---

## One-Sentence Definition

> A Marketing Surface Gate guarantees that informational pages can exist without mutating, influencing, or becoming authoritative within the product's data, trust, or SEO systems.
