# Scratch and Dent Finder

National directory for scratch and dent appliance stores.

## Architecture

- **Model:** GUIDE-FIRST (stores rendered inline on city pages)
- **Stack:** Next.js 14+, Tailwind CSS, TypeScript, Supabase, Stripe
- **Pattern:** Sobernation Behavioral Replica (Renunation pattern)

## Routes

```
/                                           # Homepage
/scratch-and-dent-appliances/               # All states
/scratch-and-dent-appliances/[state]/       # State page
/scratch-and-dent-appliances/[state]/[city]/ # City page (stores inline)
/about/
/contact/
/advertise-with-us/
/stores/new/                                # Store submission
```

## Documentation

- [Architecture Decision](docs/DECISIONS/architecture-gate-1.md)
- [Listing Pages Decision](docs/DECISIONS/listing-pages.md)
- [Session Log](docs/SESSION_LOG.md)
- [Pre-Build Prompt](docs/CLAUDE_PREBUILD_PROMPT.md)

## Development

```bash
npm install
npm run dev
```

## Gates

| Gate | Name | Type |
|------|------|------|
| 0 | Architecture Decision | Core |
| 1 | No Store Routes | Core |
| 2 | No Forms (Parity) | Core |
| 3 | Canonicals + Trailing Slash | Core |
| 4 | Nearby Cities = 12 | Core |
| 5 | Routes in urls.ts Only | Core |
| 6 | Sitemaps Work | Core |
| 7 | Adapter Boundary | Core |
| 8 | Counts Consistent | Core |
| 9 | Tracked CTAs Present | Core |
| 10 | Deterministic Ordering | Scale |
| 11 | Import Discipline | Scale |
| 12 | Sitemap Completeness | Scale |
