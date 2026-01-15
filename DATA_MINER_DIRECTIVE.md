# Data Miner Directive: ScratchAndDentFinder

## City Input Contract

- Cities loaded from: `data/packs/remaining-cities.ts`
- Do NOT scrape cities already in production database
- Focus on metro areas with high appliance retail density

## Locked Industry Pack

- Use: `appliances` from `packs/industries/appliances.ts`
- Search terms:
  - appliance repair
  - scratch and dent appliances
  - used appliances
  - discount appliances
  - appliance parts

## Hold Until PROMOTE

- All scraped data MUST stay in `outputs/` until explicit PROMOTE command
- No auto-ingestion into ScratchAndDentFinder database
- Data requires human review before promotion

## Output Requirements

- Canonical JSON with confidence scores (minimum 0.7 for inclusion)
- Run manifest for auditability
- Address field must be populated (use fallback logic)

## Notes

- This directive authorizes scraping for the ScratchAndDentFinder project
- ADR boundary: Data-miner owns scraping, ScratchAndDentFinder consumes manually
