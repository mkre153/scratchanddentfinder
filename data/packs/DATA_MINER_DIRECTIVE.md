# ScratchAndDentFinder → Data-Miner Directive

**Title:** Background City Ingestion Directive (Hold Until Promote)
**Created:** 2026-01-14
**Status:** ACTIVE

---

## Purpose

This directive authorizes the data-miner to ingest remaining US cities for ScratchAndDentFinder in the background, using explicit city lists provided by ScratchAndDentFinder, while UX and SEO work continues.

**The data-miner must NOT publish, promote, or surface this data until explicitly instructed.**

---

## Scope

| Item | Value |
|------|-------|
| Industry | Scratch & Dent Appliances |
| Provider | Outscraper only |
| Mode | Background ingestion |
| Output | Canonical JSON only |
| Visibility | **Stored, NOT surfaced** |

---

## City Input Contract (MANDATORY)

ScratchAndDentFinder is the **source of truth** for which cities to ingest.

### City List Location

```
data/packs/scratchanddentfinder-remaining-cities.ts
```

### City Counts

| Category | Count |
|----------|-------|
| Remaining (to scrape) | 133 |
| Already configured | 35 |
| Total coverage | 168 |

### Format

Each city must be in exact `"City, ST"` format:

```typescript
export const scratchAndDentRemainingCities = [
  "Birmingham, AL",
  "Huntsville, AL",
  "Anchorage, AK",
  "Chandler, AZ",
  // ... see full list in file
] as const;
```

### Rules

- ✅ Exact city names only
- ✅ Must include `City, State Abbreviation`
- ❌ No ranges
- ❌ No "all cities in X"
- ❌ No inferred geography
- ❌ No scraping without explicit list entry

**If a city is not in the list, it must NOT be scraped.**

---

## Industry Query Pack (LOCKED)

The data-miner must use ONLY these search queries:

```json
[
  "scratch and dent appliances",
  "used appliance store",
  "discount appliance outlet"
]
```

**No deviations or additions without explicit approval.**

---

## Execution Rules

When this directive is active, the data-miner must:

1. **Iterate** over the provided city list
2. **Run searches** using the locked industry pack
3. **Normalize** all results to CanonicalPlace format
4. **Apply** deduplication and confidence scoring
5. **Write outputs** only to:

```
outputs/YYYY-MM-DD/batch-N/
├── canonical.json
└── manifest.json
```

### Chunk Sizing

- **Recommended:** 25-50 cities per batch
- **Max:** 50 cities per batch
- Each batch must be independently resumable

---

## Data Holding Rules (CRITICAL)

The data-miner **MUST NOT**:

| Action | Status |
|--------|--------|
| Insert records into production database | ❌ FORBIDDEN |
| Trigger revalidation, indexing, or sitemap updates | ❌ FORBIDDEN |
| Generate or modify pages | ❌ FORBIDDEN |
| Expose data to UI | ❌ FORBIDDEN |
| Merge with previously promoted datasets | ❌ FORBIDDEN |

**This data is considered "cold / staged".**

---

## Promotion Control

Promotion is **explicit only**.

The data-miner may release or promote data **ONLY** after receiving one of these commands:

| Command | Scope |
|---------|-------|
| `PROMOTE_CITY: <City, ST>` | Single city |
| `PROMOTE_BATCH: <YYYY-MM-DD-batch-N>` | Full batch |
| `PROMOTE_ALL_STAGED_DATA` | Everything staged |

**Until then, all data remains staged and inactive.**

---

## Output Format

### canonical.json

```json
{
  "places": [
    {
      "name": "Bob's Scratch & Dent Appliances",
      "address": "123 Main St",
      "city": "Birmingham",
      "state_code": "AL",
      "zip": "35203",
      "phone": "+1-205-555-1234",
      "website": "https://example.com",
      "lat": 33.5207,
      "lng": -86.8025,
      "confidence": 0.92,
      "source": "outscraper",
      "scraped_at": "2026-01-14T12:00:00Z"
    }
  ],
  "metadata": {
    "city": "Birmingham, AL",
    "queries": ["scratch and dent appliances", "..."],
    "total_results": 15,
    "deduplicated_count": 12
  }
}
```

### manifest.json

```json
{
  "batch_id": "2026-01-14-batch-01",
  "created_at": "2026-01-14T12:00:00Z",
  "cities_processed": ["Birmingham, AL", "Huntsville, AL", "..."],
  "cities_count": 25,
  "total_places": 312,
  "status": "staged",
  "promoted_at": null
}
```

---

## Operational Notes

- Runs may be chunked (25-50 cities per batch)
- Each batch must be **resumable**
- Each batch must be **independently auditable**
- Re-runs of individual cities are allowed without affecting others
- Failed cities should be logged and retried in next batch

---

## Non-Goals (Explicit)

This directive does **NOT** authorize:

- ❌ National "scrape everything" runs
- ❌ Auto-generated city discovery
- ❌ Provider switching (Apify, etc.)
- ❌ SEO publishing decisions
- ❌ UX changes
- ❌ Database schema modifications

---

## Success Criteria

| Criterion | Required |
|-----------|----------|
| All 133 requested cities ingested and staged | ✅ |
| Canonical records have full addresses | ✅ |
| Confidence scores ≥ 0.85 where data allows | ✅ |
| No staged data visible until promoted | ✅ |
| Each batch has valid manifest | ✅ |

---

## Contact

For questions about this directive or to request changes:

- City list changes → Update `scratchanddentfinder-remaining-cities.ts`
- Industry pack changes → Requires explicit approval
- Promotion requests → Issue PROMOTE command

---

*This directive is the binding contract between ScratchAndDentFinder and the data-miner system.*
