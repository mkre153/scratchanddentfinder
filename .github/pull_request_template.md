# 🔒 UX Contract PR Checklist

**Gate 3.5 — Human Verification Required**

This PR modifies user-facing pages.
**Do not merge unless all required checks below are complete.**

---

## 🧭 Context

**PR Purpose** (required):
- [ ] Homepage
- [ ] State pages
- [ ] City pages
- [ ] Other (explain below)

**Brief description of changes:**
<!-- 1–2 sentences explaining what changed and why -->

---

## 1️⃣ Homepage — Intent & Clarity Check

**URL to verify:**
`/`

**Primary Question**
> "Do I understand what this site does and why it's useful within 5 seconds?"

### Required
- [ ] Headline communicates saving money (outcome-focused)
- [ ] Subhead explains scratch & dent in plain language
- [ ] Primary CTA routes to state pages only
- [ ] Secondary CTA is educational ("How It Works")

### Must NOT Exist
- [ ] No stats, counts, or numbers in hero
- [ ] No filters, search bars, or dropdowns
- [ ] No long paragraphs above the fold

### Visual Hierarchy
- [ ] Eye flow is Hero → TrustStrip → HowItWorks → StateGrid
- [ ] No competing elements above the fold

---

## 2️⃣ State Page — Job & Funnel Check

**URL to verify:**
`/scratch-and-dent-appliances/[state]/`

**Primary Question**
> "Does this page confirm relevance to my state and move me closer to a store?"

### Required
- [ ] State-specific hero present
- [ ] TrustStrip directly follows hero
- [ ] Short explainer is 2–3 sentences max
- [ ] City navigation appears before store listings
- [ ] Store listings are statewide
- [ ] Buying guide is one short paragraph
- [ ] Soft CTA present at bottom

### Must NOT Exist
- [ ] No filters above listings
- [ ] No store rankings or badges
- [ ] No long SEO blocks

### Hierarchy Validation
- [ ] Order is State relevance → City narrowing → Store options
- [ ] Stores do not appear before cities

---

## 3️⃣ City Page — Decision & Action Check (CRITICAL)

**URL to verify:**
`/scratch-and-dent-appliances/[state]/[city]/`

**Primary Question**
> "Can I immediately act without thinking or scrolling?"

### Required
- [ ] City hero is minimal and focused
- [ ] At least one store card visible above the fold
- [ ] Phone numbers are tap-to-call on mobile
- [ ] BuyerTips appear after listings
- [ ] Soft CTA present

### Must NOT Exist
- [ ] No filters or sorting
- [ ] No long explanations
- [ ] No state-level content

---

## 4️⃣ Nearby Cities — SEO-Only Verification

**Scroll to bottom of City Page**

### Required
- [ ] Appears after Soft CTA
- [ ] Simple link list only
- [ ] Maximum 12 nearby cities
- [ ] Visually de-emphasized

### Must NOT Exist
- [ ] No cards, icons, or images
- [ ] No placement above BuyerTips or Soft CTA
- [ ] No descriptions or copy

> ⚠️ **If Nearby Cities draws attention → FAIL**

---

## 5️⃣ Section Order Lock (Non-Negotiable)

### Homepage
- [ ] Hero
- [ ] TrustStrip
- [ ] HowItWorks
- [ ] StateGrid
- [ ] Why Use
- [ ] Soft CTA

### State Page
- [ ] State Hero
- [ ] TrustStrip
- [ ] Short Explainer
- [ ] City Navigation
- [ ] Store Listings
- [ ] Buying Guide
- [ ] Soft CTA

### City Page
- [ ] City Hero
- [ ] Store Listings
- [ ] Buyer Tips
- [ ] Local Context
- [ ] Soft CTA
- [ ] Nearby Cities

---

## 6️⃣ "Why Does This Page Exist?" Test

**Check one per page:**
- [ ] Homepage answers: "Why should I trust this site?"
- [ ] State page answers: "Is this relevant where I live?"
- [ ] City page answers: "Where do I go right now?"

> ⚠️ **If the page answers anything else first → DO NOT MERGE**

---

## ✅ Merge Authorization

- [ ] All required sections pass
- [ ] No UX contract violations
- [ ] No SEO regressions observed
- [ ] Rollback plan confirmed

```bash
git checkout main
git merge <branch-name>
```

---

## 🧠 Reviewer Notes (optional)

<!-- Any concerns, observations, or follow-ups -->

---

## Status

- [ ] Needs changes
- [ ] Approved with comments
- [ ] Approved for merge

---

> **Final Note**
> This PR template enforces **intent hierarchy**, not just correctness.
> If something feels off, pause and re-evaluate before merging.
