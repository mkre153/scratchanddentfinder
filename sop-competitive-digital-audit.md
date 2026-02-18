# Standard Operating Procedure: Competitive Digital Audit

**Document Type:** Training Manual / Operations Playbook
**Professional Title:** SEO & AEO Competitive Intelligence Assessment
**Version:** 1.0
**Date:** February 4, 2026
**Audience:** Junior-to-mid-level web audit analysts, digital strategists, SEO consultants
**Prerequisite Knowledge:** Basic understanding of HTML, web browsers, and search engines

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Professional Terminology](#2-professional-terminology)
3. [Tools Required](#3-tools-required)
4. [Phase 1: Pre-Audit Setup](#4-phase-1-pre-audit-setup)
5. [Phase 2: Client Site Initial Assessment](#5-phase-2-client-site-initial-assessment)
6. [Phase 3: Competitor Identification](#6-phase-3-competitor-identification)
7. [Phase 4: The 35-Point Competitive Audit Checklist](#7-phase-4-the-35-point-competitive-audit-checklist)
8. [Phase 5: Scoring & Comparison](#8-phase-5-scoring--comparison)
9. [Phase 6: Analysis & Recommendations](#9-phase-6-analysis--recommendations)
10. [Phase 7: Report Writing](#10-phase-7-report-writing)
11. [Templates & Frameworks](#11-templates--frameworks)
12. [Common Mistakes to Avoid](#12-common-mistakes-to-avoid)
13. [Quality Checklist](#13-quality-checklist)

---

## 1. Purpose & Scope

### What Is a Competitive Digital Audit?

A Competitive Digital Audit (also called an "SEO & AEO Competitive Intelligence Assessment") is a structured comparison of a client's website against 2-5 direct competitors. The goal is to answer three questions:

1. **Where does the client stand today?** (current position)
2. **What are competitors doing that the client isn't?** (gaps)
3. **What is nobody doing that represents an opportunity?** (greenfield)

### When to Use This SOP

Use this procedure when:
- A new client engages for SEO/digital strategy services
- An existing client wants to understand their competitive landscape
- You're building a proposal or business case for digital investment
- A client's organic traffic has declined and you need to understand why

### What This SOP Covers

This procedure covers the complete audit lifecycle from receiving a client domain to delivering a professional competitive analysis report. It was battle-tested on a real three-way audit (scratchanddentfinder.com vs. two competitors) and documented for reuse.

---

## 2. Professional Terminology

Use these terms in client-facing documents:

| Instead of... | Use... |
|---------------|--------|
| "Checking competitors" | "Competitive Digital Audit" |
| "Looking at SEO" | "SEO & AEO Competitive Intelligence Assessment" |
| "Website review" | "Technical Site Audit" |
| "Checking if Google can see the site" | "Indexation Health Assessment" |
| "Looking at the code" | "Structured Data & Schema Markup Analysis" |
| "Checking for AI stuff" | "AI Engine Optimization (AEO/GEO) Readiness Assessment" |
| "Seeing what they're doing better" | "Competitive Gap Analysis" |
| "Making a plan" | "Strategic Roadmap Development" |

---

## 3. Tools Required

### Primary Tools

| Tool | Purpose | Access |
|------|---------|--------|
| **Web Browser** (Chrome/Firefox) | Visual site inspection, DevTools | Free |
| **WebFetch** (or curl/wget) | Fetch page source, robots.txt, sitemaps | Built into Claude Code |
| **WebSearch** | Check Google indexation (`site:` searches), find competitors | Built into Claude Code |
| **Google Search Console** | Verify client indexation status (if client grants access) | Free (requires site ownership) |
| **View Page Source** | Inspect meta tags, schema markup, heading structure | Browser built-in |

### Secondary Tools (Nice to Have)

| Tool | Purpose |
|------|---------|
| **Screaming Frog** | Large-scale site crawling |
| **Ahrefs / Semrush** | Backlink analysis, keyword research, traffic estimates |
| **PageSpeed Insights** | Core Web Vitals performance |
| **Schema Validator** (schema.org) | Verify structured data correctness |
| **Rich Results Test** (Google) | Test schema eligibility for SERP features |

### What We Used in the Real Audit

For the scratchanddentfinder.com competitive audit, we used:
- **WebFetch** to pull homepage content, robots.txt, and analyze page structure for all 3 sites
- **WebSearch** with `site:domain.com` queries to check Google indexation status
- **Manual analysis** to compare schema markup, content depth, and feature sets

---

## 4. Phase 1: Pre-Audit Setup

### Step 1: Gather Client Information

Before touching any website, collect:

- [ ] Client's domain URL
- [ ] Client's business model (how do they make money?)
- [ ] Client's primary goal (more traffic? more revenue? beat competitor X?)
- [ ] Known competitors (client may already know some)
- [ ] Budget range (this determines audit depth)
- [ ] Timeline expectations

### Step 2: Create Your Working Document

Create a markdown file or spreadsheet with:
- Client domain
- Date
- Analyst name
- Competitor slots (2-5 rows)
- The 35-point checklist (see Phase 4)

### Step 3: Set Expectations

Tell the client:
> "The competitive audit takes [X days]. You'll receive a comprehensive report comparing your site against [N] competitors across [35] dimensions covering technical SEO, content strategy, features, monetization, and AI-readiness. The report includes a prioritized action plan."

---

## 5. Phase 2: Client Site Initial Assessment

**Do this BEFORE looking at any competitor.** Understanding the client's current state frames everything else.

### Step 1: First Look — Homepage Audit

Open the client's homepage and document:

1. **Page Title** — Is it present? Is it keyword-optimized? Length (aim for 50-60 chars)?
2. **Meta Description** — Present? Compelling? Length (aim for 120-160 chars)?
3. **H1 Tag** — Exactly one H1? Does it contain primary keywords?
4. **Heading Hierarchy** — Proper H1→H2→H3 nesting? No skipped levels?
5. **Content Volume** — Estimated word count? Thin (<500) or comprehensive (2000+)?
6. **Call-to-Action** — What's the primary CTA? Is it clear and prominent?
7. **Mobile Design** — Responsive? Touch-friendly?

### Step 2: Technical Checks (Do These in Order)

**robots.txt** — Fetch `https://domain.com/robots.txt`
- Does it exist? (404 = missing = problem)
- Does it reference a sitemap?
- Are appropriate paths blocked (admin, API, auth)?
- Is anything accidentally blocked (main content pages)?

Why robots.txt first: This tells you immediately if the site is telling search engines NOT to crawl it. A misconfigured robots.txt can explain zero indexation in seconds.

**sitemap.xml** — Fetch `https://domain.com/sitemap.xml`
- Does it exist?
- How many URLs are listed?
- Are URLs using the correct production domain (not localhost)?
- When was it last updated?

**Google Indexation** — Search `site:domain.com`
- How many results? (Zero = emergency)
- Which pages are indexed?
- What do the SERP snippets look like?
- Are there any unexpected pages indexed?

**Schema/Structured Data** — View page source, search for `application/ld+json`
- What schema types are implemented?
- Is the data correct and complete?
- Are there errors or warnings?

### Step 3: Document Findings

Record everything in your working document. Don't interpret yet — just capture facts.

Example:
```
## Client: scratchanddentfinder.com
- robots.txt: Present, properly configured, sitemap referenced
- sitemap.xml: 634 URLs, uses localhost in dev (potential issue)
- Google site: search: ZERO results (CRITICAL)
- Schema: Organization, WebSite, HowTo, FAQPage, BreadcrumbList, LocalBusiness
```

---

## 6. Phase 3: Competitor Identification

### How to Find Competitors

**Method 1: Ask the Client**
The client often knows their competitors. Start here.

**Method 2: Google Search**
Search for the client's primary keywords and see who ranks:
- "scratch and dent appliances"
- "scratch and dent appliance stores near me"
- "discount appliance outlets [city]"
- "[client's exact service] near me"

**Method 3: Domain Name Pattern Analysis**
This is how we found competitors in our real audit. The client was `scratchanddentfinder.com`. We checked:
- scratchanddentlocator.com ✅ (exists, active)
- scratchanddentnearme.com ✅ (exists, active)
- scratchanddent.com (check if it exists)
- scratchanddentdeals.com (check if it exists)
- scratchanddentoutlet.com (check if it exists)

**Method 4: Backlink Analysis**
Use Ahrefs or Semrush to find who links to the same sites the client links to — these are often competitors.

### How Many Competitors to Audit

| Budget / Scope | Competitor Count |
|----------------|-----------------|
| Quick audit | 2 competitors |
| Standard audit | 3 competitors (recommended) |
| Deep audit | 4-5 competitors |

Three competitors is the sweet spot — it's enough to identify patterns without becoming overwhelming.

---

## 7. Phase 4: The 35-Point Competitive Audit Checklist

For EACH site (client + competitors), check all of the following:

### Category A: Technical SEO (8 points)

| # | Check | What to Look For |
|---|-------|-----------------|
| 1 | robots.txt | Exists? Properly configured? Sitemap referenced? |
| 2 | sitemap.xml | Exists? How many URLs? Correct domain? |
| 3 | Google Indexation | `site:domain.com` — how many results? |
| 4 | HTTPS | Is the site fully on HTTPS? |
| 5 | Canonical URLs | Present? Correct? No localhost references? |
| 6 | Viewport Meta | Present? Mobile-friendly configuration? |
| 7 | Language Attribute | `lang="en"` or appropriate language set? |
| 8 | Charset | UTF-8 character encoding specified? |

### Category B: On-Page SEO (7 points)

| # | Check | What to Look For |
|---|-------|-----------------|
| 9 | Page Title | Present? Length? Keywords? |
| 10 | Meta Description | Present? Length? Compelling? |
| 11 | H1 Tag | Exactly one? Contains keywords? |
| 12 | Heading Hierarchy | Proper H1→H2→H3 nesting? |
| 13 | Content Volume | Word count estimate per page type |
| 14 | Internal Linking | How many? Strategic or random? |
| 15 | External Linking | Any? Where do they link out to? |

### Category C: Schema & Structured Data (6 points)

| # | Check | What to Look For |
|---|-------|-----------------|
| 16 | Organization Schema | Present? Complete? |
| 17 | WebSite Schema | Present? SearchAction? |
| 18 | Page-Type Schema | FAQPage, HowTo, Article, LocalBusiness, etc.? |
| 19 | Breadcrumb Schema | BreadcrumbList present on interior pages? |
| 20 | LocalBusiness Schema | For directory sites — per-listing structured data? |
| 21 | AggregateRating / Review | Any review-related schema? |

### Category D: Content Strategy (5 points)

| # | Check | What to Look For |
|---|-------|-----------------|
| 22 | Homepage Content Depth | Thin vs. comprehensive? Educational content? |
| 23 | FAQ Content | Present? On-page or separate? Schema-backed? |
| 24 | Blog/Articles | Exists? How many posts? Frequency? |
| 25 | Content Uniqueness | Unique angles? Differentiated from competitors? |
| 26 | Buying/User Guides | Educational content for the audience? |

### Category E: Features & UX (5 points)

| # | Check | What to Look For |
|---|-------|-----------------|
| 27 | Primary Feature | What's the main thing the site does? |
| 28 | Navigation Structure | Clear? Logical? Mobile hamburger? |
| 29 | Call-to-Action | Clear primary CTA? Multiple CTAs? |
| 30 | Mobile Responsiveness | Responsive design? Touch targets? |
| 31 | Trust Signals | Reviews, badges, social proof, transparency? |

### Category F: Monetization & Business (2 points)

| # | Check | What to Look For |
|---|-------|-----------------|
| 32 | Business Model | How does the site make money? |
| 33 | Pricing Transparency | Public pricing? Or "contact us"? |

### Category G: AEO/GEO Readiness (2 points)

| # | Check | What to Look For |
|---|-------|-----------------|
| 34 | AI-Friendly Content | Definitional blocks? Factual statements? Comparison tables? |
| 35 | Citation-Ready Formatting | Content structured so AI engines can quote it? |

---

## 8. Phase 5: Scoring & Comparison

### How to Score

For each of the 35 checks, score each site on a 1-5 scale:

| Score | Meaning |
|-------|---------|
| ⭐ (1) | Missing or critically broken |
| ⭐⭐ (2) | Present but poorly implemented |
| ⭐⭐⭐ (3) | Adequate — meets basic standards |
| ⭐⭐⭐⭐ (4) | Good — above average implementation |
| ⭐⭐⭐⭐⭐ (5) | Excellent — best-in-market implementation |

### How to Build the Comparison Table

Create a summary table grouped by category:

```markdown
| Dimension | Client | Competitor A | Competitor B |
|-----------|--------|-------------|-------------|
| Technical SEO | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| On-Page SEO | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Schema | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
...
```

### How to Identify Key Findings

Look for three patterns:

1. **Client leads** — dimensions where the client scores highest (strengths to leverage)
2. **Client trails** — dimensions where the client scores lowest (gaps to close)
3. **Nobody scores well** — dimensions where all sites are weak (greenfield opportunities)

Pattern #3 is often the most valuable finding — it reveals opportunities that aren't about catching up but about leapfrogging.

---

## 9. Phase 6: Analysis & Recommendations

### How to Derive Recommendations

For each gap or opportunity, ask:

1. **Impact:** How much will fixing this affect traffic/revenue? (High/Medium/Low)
2. **Effort:** How difficult is it to implement? (High/Medium/Low)
3. **Dependency:** Does anything else need to happen first?
4. **Urgency:** Is this time-sensitive? (Emergency/High/Medium/Low)

### Prioritization Framework

| Priority | Criteria | Example |
|----------|----------|---------|
| Emergency | Site is broken/invisible; nothing else matters until this is fixed | Zero Google indexation |
| High Priority | High impact + low-to-medium effort | Add FAQ schema, expand content |
| Medium Priority | Medium impact or high effort | Launch blog, build backlinks |
| Future Opportunity | Important but no urgency | AI engine optimization, advanced features |

### The Dependency Chain

Always check: **does Phase X depend on Phase Y?**

Example dependency chain from our real audit:
1. Fix indexation (nothing works without this) →
2. Technical SEO cleanup (content on a broken foundation is wasted) →
3. Content expansion (need something worth indexing) →
4. Authority building (need content worth linking to) →
5. AEO optimization (AI engines pull from search-indexed content)

Each phase unlocks the next. Presenting this chain to clients explains WHY things happen in a specific order.

---

## 10. Phase 7: Report Writing

### Report Structure

Use this template for the final deliverable:

1. **Executive Summary** (1 page) — The situation in 30 seconds; key finding; bottom-line recommendation
2. **Methodology** (half page) — What we audited, how many dimensions, what tools
3. **Competitive Scorecard** (1 page) — Summary comparison table with star ratings
4. **Detailed Findings** (5-10 pages) — Category-by-category comparison with evidence
5. **Strategic Recommendations** (2-3 pages) — Prioritized action plan with phases
6. **Appendix** — Raw data, screenshots, technical details

### Tone & Style Guidelines

- Write for a **business owner**, not a developer
- Lead with **impact**, not technical details
- Use comparison tables — executives scan, they don't read
- Every recommendation should answer: "Why should I care?" and "What happens if I don't?"
- Use specific numbers: "zero indexed pages" is more compelling than "indexation issues"
- Avoid jargon without explanation: first use of "AEO" should include "(AI Engine Optimization)"

### Formatting Rules

- Use markdown with clear heading hierarchy
- Tables for comparisons (always)
- Bullet points for recommendations (never paragraphs)
- Bold key findings and numbers
- Star ratings (⭐) for quick visual scanning

---

## 11. Templates & Frameworks

### Client Intake Questionnaire

```
1. What is your website URL?
2. What does your business do in one sentence?
3. How do you make money from this website?
4. Who are your known competitors?
5. What's your primary goal? (more traffic / more revenue / beat competitor X / other)
6. What's your budget range for this engagement?
7. When do you need results by?
8. Do you have Google Search Console access? (Y/N)
9. Do you have Google Analytics access? (Y/N)
10. Have you done SEO work before? If so, what?
```

### Audit Working Document Template

```markdown
# Competitive Digital Audit — Working Document

**Client:** [domain]
**Date:** [date]
**Analyst:** [name]

## Sites Under Audit
1. [client domain] (Client)
2. [competitor 1] (Competitor A)
3. [competitor 2] (Competitor B)

## Technical SEO
| Check | Client | Comp A | Comp B |
|-------|--------|--------|--------|
| robots.txt | | | |
| sitemap.xml | | | |
| Google indexation | | | |
[...continue for all 35 points...]

## Key Findings
1.
2.
3.

## Recommendations
### Emergency
### High Priority
### Medium Priority
### Future Opportunity
```

### Recommendation Template

```markdown
### [Recommendation Title]

**Priority:** [Emergency / High / Medium / Future]
**Impact:** [High / Medium / Low]
**Effort:** [High / Medium / Low]
**Timeline:** [X weeks/months]

**What:** [One sentence describing the action]
**Why:** [Why this matters for the client's business]
**What happens if we don't:** [Risk of inaction]
**Depends on:** [Prerequisites, if any]
```

---

## 12. Common Mistakes to Avoid

### Mistake 1: Starting with Competitors Before Auditing the Client
**Why it's wrong:** Without understanding the client's baseline, you can't identify gaps.
**Do this instead:** Always audit the client site first (Phase 2 before Phase 4).

### Mistake 2: Auditing Only the Homepage
**Why it's wrong:** Interior pages often tell a different story (broken schema, missing content, etc.).
**Do this instead:** Audit at least 4-6 page types: homepage, category/state page, detail/city page, about page, blog (if exists), and any conversion pages.

### Mistake 3: Forgetting the `site:` Search
**Why it's wrong:** A site can look perfect technically but have zero Google visibility. This is the most common "hidden" problem.
**Do this instead:** Always run `site:domain.com` early in the audit. Zero results = emergency finding.

### Mistake 4: Not Checking robots.txt
**Why it's wrong:** A misconfigured robots.txt can block all indexation. Takes 5 seconds to check.
**Do this instead:** Check robots.txt within the first 5 minutes of every audit.

### Mistake 5: Reporting Problems Without Recommendations
**Why it's wrong:** Clients pay for solutions, not just diagnostics.
**Do this instead:** Every finding should have a corresponding recommendation with priority and impact.

### Mistake 6: Not Explaining WHY Things Are Prioritized
**Why it's wrong:** "Fix indexation first" means nothing without explaining "because nothing else matters if Google can't see you."
**Do this instead:** Always explain the dependency chain — each phase unlocks the next.

### Mistake 7: Ignoring AEO/GEO Entirely
**Why it's wrong:** AI search is the fastest-growing discovery channel. Ignoring it is like ignoring mobile in 2015.
**Do this instead:** Always include AEO assessment, even if brief. Most sites score zero — that's the finding.

### Mistake 8: Writing for Developers Instead of Business Owners
**Why it's wrong:** The person paying for the audit probably doesn't know what "schema markup" means.
**Do this instead:** Lead with business impact. "Your competitors appear in rich Google results; you don't" is better than "You're missing FAQPage schema."

---

## 13. Quality Checklist

Before delivering the final report, verify:

- [ ] All 35 audit points checked for every site
- [ ] Comparison tables are complete and accurate
- [ ] Star ratings are consistent and justified
- [ ] Every finding has a corresponding recommendation
- [ ] Recommendations are prioritized (Emergency → High → Medium → Future)
- [ ] Dependency chain is explained (what unlocks what)
- [ ] Executive summary is readable in 60 seconds
- [ ] Tone is appropriate for business audience
- [ ] Specific numbers used (not vague language)
- [ ] AEO/GEO assessment included
- [ ] No orphan findings (everything ties to recommendations)
- [ ] Spell-check and formatting review complete
- [ ] File saved to agreed-upon location

---

*SOP Version 1.0 — Based on the scratchanddentfinder.com competitive audit, February 2026*
*This document is a living guide. Update it after each audit with lessons learned.*
