# Restart Guide - Stripe Testing

## Current State (Jan 13, 2026)

### ✅ Completed
- Stripe webhook handler fully working (`/api/webhooks/stripe/route.ts`)
- Checkout API complete (`/api/checkout/route.ts`)
- Custom fixture testing working with `--add` flags
- Store ID 1 updated with `featured_tier: "monthly"` (test data)

### ⏸️ Not Yet Built
- Auth pages (`/auth/signin`, `/auth/signup`)
- Full E2E user flow (requires auth)

---

## Commands to Restart

### 1. Start Next.js Dev Server
```bash
cd ~/Sites/scratchanddentfinder
npm run dev
```

### 2. Start Stripe CLI Listener (new terminal)
```bash
cd ~/Sites/scratchanddentfinder
stripe listen --forward-to localhost:3000/api/webhooks/stripe/
```

> **Note:** The webhook secret is already in `.env.local` and matches the CLI.

### 3. Test Webhook (optional)
```bash
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.storeId=1 \
  --add checkout_session:metadata.tier=monthly \
  --add checkout_session:metadata.userId=test-user-123
```

---

## Verify Everything Works

### Check store was updated:
```bash
curl -s "https://lirikzfdrcrnkvlvzazq.supabase.co/rest/v1/stores?select=id,name,featured_tier,featured_until&id=eq.1" \
  -H "apikey: $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)" \
  -H "Authorization: Bearer $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)"
```

---

## Reset Test Data (if needed)

To reset store 1 back to no tier:
```bash
curl -X PATCH "https://lirikzfdrcrnkvlvzazq.supabase.co/rest/v1/stores?id=eq.1" \
  -H "apikey: $(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)" \
  -H "Authorization: Bearer $(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"featured_tier": null, "featured_until": null}'
```

---

## Next Steps (when you return)

1. **Option A: More Webhook Testing**
   - Test `subscription.created`, `subscription.deleted` events
   - Test annual tier

2. **Option B: Build Auth Flow**
   - Create `/auth/signin` page
   - Create `/auth/signup` page
   - Integrate Supabase Auth UI
   - Test full user checkout journey

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/api/webhooks/stripe/route.ts` | Webhook handler |
| `app/api/checkout/route.ts` | Creates checkout sessions |
| `lib/stripe.ts` | Stripe config & helpers |
| `lib/queries.ts` | Database queries (setStoreTierFromCheckout, etc.) |
| `.env.local` | All secrets (Stripe, Supabase) |
