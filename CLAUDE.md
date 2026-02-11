# Project Context: Scratch & Dent Finder

## What This Project Is
- **Site:** scratchanddentfinder.com — a scratch-and-dent appliance store directory covering 50 US states
- **Owner:** MK153 Inc.
- **Tech Stack:** Next.js 14 + Tailwind CSS, hosted on Vercel, data in Supabase (exanqdkidybtrppmngmy)
- **Business Model:** AdSense monetization + premium store listings

## Competitive Landscape (Audited Feb 4, 2026)
- **scratchanddentlocator.com** ("Locator") — largest data scale (10,222 stores, 4,866 cities), actively indexed by Google, no robots.txt, weakest technical SEO
- **scratchanddentnearme.com** ("NearMe") — most sophisticated monetization (public pricing page, "Claim Your Store" feature), 9,449 verified stores, actively indexed
- **Finder (our site)** — best technical foundation (schema, robots.txt, breadcrumbs, LocalBusiness markup), 11,531 stores

## Key Competitive Advantage
- LocalBusiness schema on city pages (15+ instances per page) — neither competitor has this
- NO competitor has any AEO/GEO (AI Engine Optimization) strategy — first mover wins

## Anti-Loop Rules (IMPORTANT)
1. **Write to disk first, review later** — never hold large generated content in conversation context
2. **One deliverable per turn** — complete and verify each file before starting the next
3. **Never re-read completed files into context** — once saved, leave them on disk
4. **Verify after every write** — use `wc -l` to confirm the file exists and has substance

## Active Plan: Tier 2 Quick Wins
- **Doc:** `docs/TIER2-QUICK-WINS-PLAN.md`
- **Items:** Quick Assess widget (flag), city enrichment verify, blog scale to 20 posts, newsletter infra, audio narration
- **Source:** Competitive audit Feb 2026 (Yale, Consumer Reports, Wirecutter, AJ Madison)

## Sam Integration
- **Client config:** `~/Shared/platform/nonprofit-sam/src/config/clients/scratchanddentfinder.json`
- **Active tasks:** seo, content, communications (grants/compliance/reporting disabled)
- **Tier:** internal (not a nonprofit client)

## Sister Site
- **appliancetechfinder.com** — appliance repair directory (separate project at ~/Shared/sites/appliancetechfinder)
- Cross-links between SDF and ATF for mutual SEO benefit
