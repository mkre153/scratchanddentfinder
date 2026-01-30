# SEO & AEO Structure Framework

**Site:** Scratch & Dent Finder
**Type:** Local Directory / Geo-Targeted Site
**Status:** Active
**Last Updated:** 2025-01-26

---

## Framework Overview

This document defines the SEO and AI Engine Optimization (AEO) structure for scratchanddentfinder.com, a local directory site helping users find scratch and dent appliance stores by location.

**Directory Site Characteristics:**
- Geo-targeted URL structure (state/city)
- Location-based content variation
- LocalBusiness schema for listed stores
- Programmatic page generation

---

## 1. Keyword Strategy

### Primary Keywords (Location Intent)

| Keyword Pattern | Example | Page Type | Priority |
|----------------|---------|-----------|----------|
| scratch and dent appliances [state] | scratch and dent appliances california | State | P0 |
| scratch and dent appliances [city] | scratch and dent appliances los angeles | City | P0 |
| scratch and dent appliance stores near me | — | All | P0 |
| discount appliances [city] | discount appliances los angeles | City | P1 |

### Secondary Keywords (Informational Intent)

| Keyword | Intent | Target Page |
|---------|--------|-------------|
| what is scratch and dent | Informational | Homepage, Buyers Guide |
| is scratch and dent worth it | Consideration | Buyers Guide |
| scratch and dent vs used | Comparison | Buyers Guide |
| scratch and dent warranty | Research | Buyers Guide |
| how much discount scratch and dent | Research | Buyers Guide |

### Long-Tail Keywords

| Keyword | Page Target |
|---------|-------------|
| scratch and dent refrigerators near me | City pages |
| scratch and dent washer dryer [city] | City pages |
| outlet appliance stores [state] | State pages |
| floor model appliances [city] | City pages |
| where to buy dented appliances | Homepage |

### Keywords to AVOID

| Keyword | Reason |
|---------|--------|
| cheap appliances | Perceived low quality |
| damaged appliances | Implies non-functional |
| broken appliances | Misleading |
| clearance junk | Derogatory |

---

## 2. Page Metadata Templates

### Homepage

```
Title: Scratch & Dent Finder | Find Scratch and Dent Appliance Stores
Description: Find scratch and dent appliance stores near you. Save 30-70% on quality appliances with minor cosmetic damage.
```

### All States Page

```
Title: Scratch and Dent Appliances by State | Scratch & Dent Finder
Description: Browse scratch and dent appliance stores in all 50 states. Find discount appliances near you and save 30-70%.
```

### State Page Template

```
Title: Scratch and Dent Appliances in {State} | Scratch & Dent Finder
Description: Find {store_count} scratch and dent appliance stores in {State}. Browse {city_count} cities and save 30-70% on quality appliances.
```

### City Page Template

```
Title: Scratch and Dent Appliances in {City}, {State} | Scratch & Dent Finder
Description: Find {store_count} scratch and dent appliance stores in {City}, {State}. Save 30-70% on refrigerators, washers, dryers, and more.
```

### Metadata Requirements

- **Title:** 50-70 characters
- **Description:** 140-160 characters
- **Keywords:** Include location + "scratch and dent" + "appliances"
- **Uniqueness:** Every page must have unique title/description

---

## 3. URL Structure

### Hierarchy

```
/                                              → Homepage
/scratch-and-dent-appliances/                  → All States
/scratch-and-dent-appliances/{state}/          → State Page
/scratch-and-dent-appliances/{state}/{city}/   → City Page
/about/                                        → About
/buyers-guide/                                 → Buyer's Guide
/contact/                                      → Contact
```

### URL Rules

- ✅ All URLs end with trailing slash
- ✅ Lowercase only
- ✅ Hyphens for word separation
- ✅ State/city slugs derived from name (e.g., "los-angeles")
- ❌ No query parameters for content variation
- ❌ No numeric IDs in URLs

### Canonical Rules

- All canonicals are absolute HTTPS URLs
- Self-referencing canonical on each page
- Trailing slash required

---

## 4. Heading Structure

### Homepage

```
H1: Find Scratch & Dent Appliances Near You
  H2: How Scratch & Dent Works
    H3: Step 1 (implicit in component)
    H3: Step 2
    H3: Step 3
  H2: Browse by State
  H2: Featured Stores
```

### State Page

```
H1: Scratch and Dent Appliances in {State}
  H2: Cities in {State}
  H2: All {Store_count} Stores in {State}
  H2: Nearby States
```

### City Page

```
H1: Scratch and Dent Appliances in {City}, {State}
  H2: Stores in {City}
    H3: {Store Name} (per store)
  H2: Nearby Cities
```

### Buyer's Guide

```
H1: Should You Buy This Scratch & Dent Appliance?
  H2: What Our Tool Analyzes
  H2: Signs of a Good Deal / Red Flags
  H2: Frequently Asked Questions
    H3: What is scratch and dent?
    H3: How much should I expect to save?
    ... (5 FAQ items)
```

### Heading Rules

- ✅ Exactly 1 H1 per page
- ✅ H1 contains primary keyword + location
- ✅ H2s follow H1 (no orphans)
- ✅ H3s follow H2s (proper nesting)
- ❌ No skipped levels (H1 → H3)

---

## 5. Schema Markup (JSON-LD)

### Required on ALL Pages

#### Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Scratch & Dent Finder",
  "url": "https://scratchanddentfinder.com/",
  "logo": "https://scratchanddentfinder.com/icon",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@scratchanddentfinder.com",
    "contactType": "customer service"
  }
}
```

#### WebSite Schema

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Scratch & Dent Finder",
  "url": "https://scratchanddentfinder.com/"
}
```

### State/City Pages: BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://scratchanddentfinder.com/" },
    { "@type": "ListItem", "position": 2, "name": "All States", "item": "https://scratchanddentfinder.com/scratch-and-dent-appliances/" },
    { "@type": "ListItem", "position": 3, "name": "{State}", "item": "https://scratchanddentfinder.com/scratch-and-dent-appliances/{state}/" }
  ]
}
```

### City Pages: LocalBusiness (per store)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{Store Name}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{Address}",
    "addressLocality": "{City}",
    "addressRegion": "{State}",
    "postalCode": "{ZIP}",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{lat}",
    "longitude": "{lng}"
  },
  "telephone": "{phone}",
  "url": "{website}"
}
```

**LocalBusiness Guardrails:**
- Only emit if `isApproved === true`
- Must have address AND coordinates
- Must have phone OR website

### Buyer's Guide: FAQPage (MISSING - TO IMPLEMENT)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is scratch and dent?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scratch and dent appliances have cosmetic damage (scratches, dents, scuffs) but are functionally perfect..."
      }
    },
    {
      "@type": "Question",
      "name": "How much should I expect to save?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Discounts typically range from 15-40% depending on damage visibility..."
      }
    }
    // ... 5 total FAQ items
  ]
}
```

### Homepage: HowTo (MISSING - TO IMPLEMENT)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How Scratch & Dent Works",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Minor Cosmetic Damage",
      "text": "Small dents, scratches, or packaging flaws from shipping and handling."
    },
    {
      "@type": "HowToStep",
      "name": "Big Discounts",
      "text": "Save 20-60% off retail prices on brand-name appliances."
    },
    {
      "@type": "HowToStep",
      "name": "Fully Functional",
      "text": "Same performance and warranty coverage as new appliances."
    }
  ]
}
```

---

## 6. AI-Search Optimization (AEO)

### AI-Friendly Summary Block

Add structured content that AI systems can easily parse:

```markdown
## About Scratch & Dent Finder

**What:** Scratch & Dent Finder is a directory of scratch and dent appliance stores across the United States.

**Purpose:** Helps consumers find local retailers selling appliances with minor cosmetic damage at 30-70% off retail prices.

**How it works:**
1. Browse by state or city to find stores near you
2. View store details including address, phone, and ratings
3. Visit stores to inspect appliances before purchasing

**What is scratch and dent?**
Scratch and dent appliances are brand-new units with minor cosmetic imperfections—small dents, scratches, or scuffs from shipping and handling. They are fully functional with the same warranty coverage as retail units.

**Typical savings:** 20-60% off retail prices depending on damage visibility.
```

### Placement

| Placement | Recommended Page |
|-----------|------------------|
| Visible "About" section | Homepage footer |
| FAQ section | Buyers Guide |
| JSON-LD only | All pages (Organization) |

---

## 7. Content Signals for AI Systems

### Entity Associations

| Entity | Relationship | Example |
|--------|--------------|---------|
| Scratch & Dent Finder | is a | directory of appliance stores |
| Scratch and dent | is a type of | discounted merchandise |
| Scratch and dent appliances | have | minor cosmetic damage |
| Scratch and dent stores | sell | appliances at 30-70% off |
| Buyers | can save | 20-60% on brand-name appliances |

### Clear Factual Statement Patterns

Include these patterns for AI extraction:

```
"Scratch & Dent Finder is a [directory] that [helps consumers find stores]."
"Scratch and dent appliances have [minor cosmetic damage] but are [fully functional]."
"Typical savings range from [20-60%] depending on [damage visibility]."
"All listed stores [sell brand-name appliances] at [discounted prices]."
```

### Avoid Ambiguous Language

| Ambiguous | Clear |
|-----------|-------|
| "Find great deals" | "Find stores selling appliances at 30-70% off" |
| "Damaged goods" | "Appliances with minor cosmetic imperfections" |
| "Cheap appliances" | "Discounted brand-name appliances" |

---

## 8. Technical SEO Checklist

### Performance

- [ ] Page load < 3 seconds on mobile 3G
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Images optimized (WebP, lazy loading)
- [ ] CSS/JS minified

### Mobile

- [ ] Mobile-responsive design
- [ ] Touch targets ≥ 48px
- [ ] No horizontal scroll
- [ ] Readable font sizes (≥16px body)

### Indexing

- [x] robots.txt allows public pages
- [x] robots.txt disallows /admin, /dashboard, /api
- [x] XML sitemap at /sitemap.xml
- [x] All canonicals absolute HTTPS with trailing slash
- [x] noindex on 0-store state/city pages
- [ ] hreflang (future - if multilingual)

### Security

- [x] HTTPS enabled
- [x] SSL certificate valid
- [ ] No mixed content warnings

---

## 9. Internal Linking Strategy

### Navigation Links

| From | To | Context |
|------|-----|---------|
| Header | All States | Primary nav |
| Header | Buyers Guide | Primary nav |
| Footer | About, Contact, Privacy | Footer nav |
| Homepage | State pages | "Browse by State" |
| State pages | City pages | City listings |
| City pages | Nearby cities | Related content |
| City pages | State page | Breadcrumb |

### Contextual Links

| From | To | Anchor Text Pattern |
|------|-----|---------------------|
| City page | Buyers Guide | "Evaluate your deal" |
| Homepage | Buyers Guide | "Not sure? Try our buyer's tool" |
| State page | Homepage | Logo/brand link |

### Link Requirements

- ✅ All internal links use relative paths from urls.ts
- ✅ No broken internal links (404s)
- ✅ Breadcrumbs on all state/city pages
- ❌ No orphan pages (unreachable from navigation)

---

## 10. Rich Snippet Opportunities

### Currently Implemented

| Type | Status | Pages |
|------|--------|-------|
| Organization | ✅ Active | All |
| WebSite | ✅ Active | All |
| BreadcrumbList | ✅ Active | State, City |
| LocalBusiness | ✅ Active | City (per store) |

### Opportunities (Not Implemented)

| Type | Opportunity | Page |
|------|-------------|------|
| FAQPage | High (5 Q&A exist) | /buyers-guide/ |
| HowTo | Medium (3-step process) | Homepage |
| ItemList | Low (store listings) | City pages |

### Rich Result Testing

Validate schemas at: https://search.google.com/test/rich-results

---

## 11. Monitoring & Measurement

### Search Console Targets

| Metric | Baseline | 30-Day Target |
|--------|----------|---------------|
| Impressions | Establish | Growth |
| Clicks | Establish | Growth |
| CTR | > 2% | > 3% |
| Position | < 50 avg | < 30 avg |

### Target Queries to Monitor

1. "scratch and dent appliances near me"
2. "scratch and dent appliances [major city]"
3. "scratch and dent appliance stores [state]"
4. "scratchanddentfinder" (branded)
5. "is scratch and dent worth it"

### AI Search Monitoring

- Track mentions in AI-generated answers (Perplexity, ChatGPT, Gemini)
- Monitor for "Scratch & Dent Finder" in response sources
- Test conversational queries:
  - "Where can I find scratch and dent appliances in [city]?"
  - "What is a good price for a scratch and dent refrigerator?"

---

## 12. Content & Compliance

### Safe Content Patterns

| Safe | Example |
|------|---------|
| Factual savings ranges | "Save 30-70% on brand-name appliances" |
| Process description | "Find stores near you by browsing by state or city" |
| Feature statement | "All stores are verified before listing" |

### Avoid

| Avoid | Reason |
|-------|--------|
| "Best deals guaranteed" | Unverifiable claim |
| "Lowest prices anywhere" | Comparative claim |
| "All appliances work perfectly" | Can't guarantee third-party inventory |

### Directory-Specific Guidelines

- Store listings reflect current data (regular updates)
- Contact information verified where possible
- No endorsement of specific stores implied
- Clear distinction between directory content and user-generated content

---

## Implementation Checklist

### Phase 1: Schema Additions

- [ ] Add FAQPage schema to /buyers-guide/
- [ ] Add HowTo schema to homepage
- [ ] Validate all schemas with Rich Results Test

### Phase 2: AEO Enhancements

- [ ] Add AI-friendly summary block to homepage
- [ ] Add entity association patterns to About page
- [ ] Ensure all pages have clear factual statements

### Phase 3: Documentation

- [x] Create this framework document
- [x] Create automated audit script
- [ ] Document keyword strategy decisions
- [ ] Set up Search Console baseline

---

*Last Updated: 2025-01-26*
