# Incident Response Runbook

Audience: an on-call engineer with repo access and a Cloudflare dashboard login. Assume no oral history. Every command and link below has been verified against the current `workers/` config and `.github/workflows/deploy.yml`.

---

## 1. Where to look first

When something breaks in production, walk these dashboards in order before touching code:

| # | Surface | URL / location | What you can see |
|---|---------|----------------|------------------|
| 1 | Cloudflare Workers — Logs | dash.cloudflare.com → Workers & Pages → pick worker → **Logs** (live tail) | Last 100 invocations, status codes, console output. Observability is enabled on every worker (`[observability] enabled = true` in each `*-wrangler.toml`). |
| 2 | Cloudflare Pages | dash.cloudflare.com → Workers & Pages → `funeral-brochure-app` | Frontend deploys, build logs, current commit SHA. |
| 3 | Sentry — Workers project | sentry.io → org `funeralpress` → project (set in GitHub repo var `SENTRY_PROJECT`) | All workers call `Sentry.withSentry({ dsn: env.SENTRY_DSN, environment: env.ENVIRONMENT, tracesSampleRate: 0.1 })`. Worker exceptions land here. |
| 4 | Sentry — Frontend project | sentry.io → org `funeralpress` → project `funeralpress-frontend` (default in `vite.config.js`) | Browser exceptions. DSN injected at build time via `VITE_SENTRY_DSN`. |
| 5 | GitHub Actions | github.com/<org>/funeral-press/actions | Status of the last `Deploy FuneralPress` run. Lint / test / build / deploy-frontend / deploy-workers jobs. |
| 6 | Paystack dashboard | dashboard.paystack.com → Transactions / Customers / Disputes | Charge status, refunds, disputes, webhook delivery log (`Settings → API Keys & Webhooks → Webhook Logs`). |
| 7 | Resend dashboard | resend.com → Logs | Receipt and dunning email delivery, bounces. Used by `donation-api` (receipts) and `auth-api` (dunning sweep). |
| 8 | Cloudflare D1 | dash.cloudflare.com → D1 → `funeralpress-db` (id `eab2488e-18cd-4920-adf8-7db724facee5`) | Query console, size & quota. |
| 9 | Cloudflare KV | dash.cloudflare.com → KV → namespace by id (see `KV_OWNERSHIP.md`) | Browse keys, edit values, set kill-switches. |

If the issue is user-reported, also check the Resend Logs view filtered by recipient address — receipt failures are silent from the user's POV.

---

## 2. Per-worker quick reference

Seven workers in production. All share the same D1 (`funeralpress-db`, id `eab2488e-18cd-4920-adf8-7db724facee5`) except where noted.

| Worker name | Route | Source | What it does | KV bindings | Cron | Common failures |
|-------------|-------|--------|--------------|-------------|------|-----------------|
| `funeralpress-auth-api` | `auth-api.funeralpress.org/*` | `workers/auth-api.js` | Google OAuth, JWT issue/refresh, phone OTP send/verify, subscription webhooks, dunning cron | `RATE_LIMITS`, `OTP_KV` | `0 8 * * *` daily — `runDunningCron` | Bad `JWT_SECRET`; expired Google client; SMS provider down (Termii/Twilio); Resend bounces |
| `funeralpress-donation-api` | `donation-api.funeralpress.org/*` | `workers/donation-api.js` | Donation init/charge, Paystack webhook, donor wall, admin tools, daily reconciliation cron | `MEMORIAL_PAGES_KV`, `RATE_LIMITS`, `OTP_KV` | `0 4 * * *` daily — `reconcileDay` + `activatePendingMomoChanges` (gated by `RECONCILIATION_ENABLED`) | Webhook IP allowlist mismatch; bad `PAYSTACK_WEBHOOK_SECRET`; `DONATIONS_GLOBAL_PAUSED=true` or KV kill-switch set |
| `brochure-memorial-api` | `memorial-api.funeralpress.org/*` | `workers/memorial-page-api.js` | CRUD for memorial pages, slug generation, pushes anonymized tweets to `tweet_queue` | `MEMORIAL_PAGES_KV`, `RATE_LIMITS` | — | KV TTL expiry (1 year) — historical memorials disappear; D1 unavailable |
| `brochure-share-api` | `share-api.funeralpress.org/*` | `workers/share-api.js` | Generates 6-char share codes for brochures; 30-day TTL | `BROCHURES_KV`, `RATE_LIMITS` | — | Share code collision (5 attempts before 500); KV size growth |
| `brochure-live-service-api` | `live-api.funeralpress.org/*` | `workers/live-service-api.js` | Live service event pages | `LIVE_SERVICE_KV`, `RATE_LIMITS` | — | Same pattern as memorial-api |
| `funeralpress-twitter-bot` | (no route — cron only) | `workers/twitter-bot.js` | Reads `tweet_queue` D1 table, posts to X | (none) | `0 */12 * * *` (every 12h) — `processTweetQueue` | Twitter API rate limit; expired bearer token; queue rows stuck in `processing` state |
| `funeralpress-ai-writer` | `ai.funeralpress.org/*` | `workers/brochure-ai-writer.js` | Workers AI tribute/obituary generator | `RATE_LIMITS` | — | Workers AI quota; long-running prompt timeout |

Logs for every worker land in **Cloudflare → Workers & Pages → <worker name> → Logs**. Sentry breadcrumbs are tagged by worker name automatically because each `Sentry.withSentry` call passes `env.ENVIRONMENT`.

---

## 3. Incident playbooks

### 3a. All workers returning 5xx

**Symptoms:** Sentry spike across multiple worker projects. Frontend shows persistent errors. Health checks (`GET /health` on each worker) fail.

**Diagnostics:**
```bash
# Hit each worker's health endpoint
curl -i https://auth-api.funeralpress.org/health
curl -i https://donation-api.funeralpress.org/health
curl -i https://memorial-api.funeralpress.org/health
curl -i https://share-api.funeralpress.org/health
curl -i https://live-api.funeralpress.org/health
curl -i https://ai.funeralpress.org/health   # if implemented
```

If all five return 5xx but the route resolves, suspect a shared dependency:

1. **D1 outage** — go to dashboard → D1 → `funeralpress-db` → "Status". If degraded, check Cloudflare status page (`www.cloudflarestatus.com`).
2. **KV outage** — same pattern; check status page.
3. **Recent bad deploy** — `git log --oneline main -5` and check the latest GitHub Actions run. If green and recent, suspect runtime issue in the code; rollback per `DEPLOY_AND_ROLLBACK.md`.
4. **Account-level issue** — check Cloudflare account email for billing or abuse notices.

**Mitigation:** rollback to the prior good deploy (`DEPLOY_AND_ROLLBACK.md` § Rollback). For D1/KV outages, no app-level mitigation — wait for Cloudflare and post a status update.

**Escalation:** Cloudflare support (Enterprise plan if upgraded; otherwise community + status page).

---

### 3b. Paystack webhook failures

**Symptoms:** Successful Paystack charges in their dashboard, but `donations` table still shows `status = 'pending'`. Donor wall does not update. Sentry shows 401s on `POST /paystack/webhook`.

**Diagnostics:**
```bash
# Inspect recent webhook signatures from Paystack
# Paystack dashboard → Settings → API Keys & Webhooks → Webhook Logs
```

In `workers/donation-api.js` lines 186–212 the webhook handler:
1. Rejects if source IP is not in `PAYSTACK_WEBHOOK_IPS = ['52.31.139.75', '52.49.173.169', '52.214.14.220']` (defined in `workers/utils/paystack.js`).
2. Verifies HMAC signature using `env.PAYSTACK_WEBHOOK_SECRET`.
3. Inserts into `processed_webhooks` for idempotency.

**Mitigation steps:**
1. **IP changed** — Paystack publishes their webhook IPs at https://paystack.com/docs/payments/webhooks. If they have changed, update `workers/utils/paystack.js` line 117 and redeploy `donation-api`.
2. **Signature mismatch** — webhook secret was rotated in Paystack dashboard but not in worker. Set new secret:
   ```bash
   wrangler secret put PAYSTACK_WEBHOOK_SECRET --config workers/donation-api-wrangler.toml
   ```
3. **Idempotency duplicate** — check `processed_webhooks` D1 table. If `event_id` exists with stale data, deletion is safe (events are idempotent at Paystack level).

**Reconciliation safety net:** the daily `reconcileDay` cron at 04:00 UTC pulls the last 24h of Paystack transactions and reconciles. Confirm `RECONCILIATION_ENABLED = "true"` in `donation-api-wrangler.toml` — currently it ships as `"false"` and is **a known gap** (see § Gaps).

**Escalation:** Paystack support (`support@paystack.com`) for delivery logs.

---

### 3c. Dunning emails not sending

**Symptoms:** Subscriptions in `past_due` status are not transitioning to Day-1/Day-3/Day-7 outreach. Resend Logs show no traffic from `auth-api`.

**Diagnostics:**
1. The dunning cron runs at `0 8 * * *` UTC inside `funeralpress-auth-api` (`workers/auth-api.js` line 2664). Verify the cron fired:
   - dashboard → Workers & Pages → `funeralpress-auth-api` → **Triggers** tab → Cron history.
2. Check Sentry for `[scheduled] runDunningCron failed` messages.
3. Verify `RESEND_API_KEY` secret is set:
   ```bash
   wrangler secret list --config workers/auth-api-wrangler.toml
   ```
4. Hit Resend's status page (status.resend.com).

**Mitigation:**
1. Re-set the secret if missing/rotated:
   ```bash
   wrangler secret put RESEND_API_KEY --config workers/auth-api-wrangler.toml
   ```
2. Trigger a manual run by deploying (cron is fired by Cloudflare; there is no exposed HTTP endpoint to invoke `runDunningCron` ad-hoc — **gap**).

**Escalation:** Resend support; check sender domain DKIM/SPF in Resend dashboard.

---

### 3d. Donation page returns 404

**Symptoms:** `GET https://donation-api.funeralpress.org/donation/init?...` returns 404 or 503.

**Diagnostics:**
```bash
curl -i https://donation-api.funeralpress.org/health
```

The donation rail is feature-flagged. In `workers/donation-api-wrangler.toml`:
- `DONATIONS_ENABLED` defaults to `"false"` — when false, donor-flow paths return 503 with `"Donation rail not enabled"` (see `workers/donation-api.js` lines 172–182).
- `DONATIONS_GLOBAL_PAUSED` is a static kill switch.
- A KV kill-switch at key `kill_switch:donations_paused` in `RATE_LIMITS` overrides the env var (line 155).

**Mitigation:**
1. Check the KV kill switch:
   ```bash
   wrangler kv key get --namespace-id=3cf6b47818c04ca8828461650478a6c1 "kill_switch:donations_paused"
   ```
2. Clear it if set incorrectly:
   ```bash
   wrangler kv key delete --namespace-id=3cf6b47818c04ca8828461650478a6c1 "kill_switch:donations_paused"
   ```
3. Toggle `DONATIONS_ENABLED = "true"` in `workers/donation-api-wrangler.toml` and redeploy.

**Escalation:** product owner before flipping `DONATIONS_ENABLED` — this changes user-visible behaviour.

---

### 3e. Signup spike triggering rate limits

**Symptoms:** Users report "Too many requests" (HTTP 429). Sentry breadcrumbs show 429 responses on `/auth/google` and `/auth/refresh`.

**Diagnostics:** rate limits live in `workers/utils/rateLimiter.js`:
```
auth: 10 req/min, payments: 5, upload: 20, sync: 30,
authenticated: 60, public: 120
```
Keys are `rate:<ip>:<routeGroup>` with 60s TTL in the `RATE_LIMITS` namespace (id `3cf6b47818c04ca8828461650478a6c1`).

```bash
# Inspect a hot IP's counter
wrangler kv key get --namespace-id=3cf6b47818c04ca8828461650478a6c1 "rate:<ip>:auth"
```

**Mitigation:**
1. **Legitimate traffic spike (e.g. press hit):** raise the per-route limit in `RATE_LIMITS` constants and redeploy. Do not raise `auth` above ~30 without enabling Turnstile.
2. **Single bad IP:** add a Cloudflare WAF rule — dashboard → Security → WAF → Custom rules — to block or challenge that IP. Faster than redeploy.
3. **OTP-specific limits:** see `workers/auth-api.js` lines 2192–2210. Per-phone (3/10min, 10/24h), per-IP (20/h). Phone lockout key `otp:lockout:<phone>` lasts 1 hour. Clear with:
   ```bash
   wrangler kv key delete --namespace-id=3cf6b47818c04ca8828461650478a6c1 "otp:lockout:+233xxxxxxxxx"
   ```

**Escalation:** if abuse, engage Cloudflare Bot Management (paid).

---

### 3f. D1 quota exhausted

**Symptoms:** All workers that bind D1 return 5xx. Cloudflare dashboard shows D1 row count near plan limit. Errors mentioning `D1_ERROR` in Sentry.

**Diagnostics:**
```bash
wrangler d1 info funeralpress-db
wrangler d1 execute funeralpress-db --command "SELECT name, COUNT(*) FROM sqlite_master WHERE type='table' GROUP BY name;"
```

Tables most likely to grow unboundedly:
- `analytics_events` (`auth-api` writes on every event from frontend)
- `audit_log`
- `phone_otps` (10-minute expiry, no automatic vacuum)
- `processed_webhooks` (forever, idempotency table)

**Mitigation:**
1. Truncate `analytics_events` older than 90 days:
   ```bash
   wrangler d1 execute funeralpress-db --command "DELETE FROM analytics_events WHERE created_at < strftime('%s','now','-90 days')*1000;"
   ```
2. Truncate consumed/expired `phone_otps` older than 24 hours:
   ```bash
   wrangler d1 execute funeralpress-db --command "DELETE FROM phone_otps WHERE expires_at < strftime('%s','now','-1 day')*1000;"
   ```
3. Upgrade D1 plan in dashboard → D1 → Settings.

**Gap:** there is no scheduled cleanup cron for these tables. Recommended fix: add a weekly cleanup task to `auth-api`'s `scheduled` handler.

**Escalation:** Cloudflare account contact.

---

### 3g. KV namespace deletion (accidental)

**Symptoms:** All workers binding the deleted namespace return 5xx with `KV_ERROR`. Specific surfaces (donor wall, memorial pages, share codes) go blank.

**Recovery is namespace-specific.** Refer to `KV_OWNERSHIP.md` for the per-namespace recoverability matrix. Quick summary:

| Namespace | Recoverable? | How |
|-----------|--------------|-----|
| `RATE_LIMITS` | Yes | Recreate empty; counters re-populate within 60s. Kill-switches must be re-set manually. |
| `MEMORIAL_PAGES_KV` | Partially | Memorial records are also in D1 `memorials`. KV is a 1-year-TTL cache; rebuild by replaying memorial creates from D1 (manual script — **gap, no automation exists**). |
| `BROCHURES_KV` | **No** | Shared brochures live only in KV. Deletion = lost data. Existing share links 404. |
| `LIVE_SERVICE_KV` | **No** | Same — live-service pages are KV-only. |
| `OTP_KV` | Yes | Currently unused in source; only provisioned. Recreating it is a no-op. |

**Recovery steps:**
1. Recreate the namespace:
   ```bash
   wrangler kv namespace create "MEMORIAL_PAGES_KV"
   ```
2. Update the `id = "..."` line in every `*-wrangler.toml` that binds it.
3. Redeploy all affected workers (see `DEPLOY_AND_ROLLBACK.md`).
4. For data-loss namespaces (`BROCHURES_KV`, `LIVE_SERVICE_KV`), notify users; there is no backup.

**Prevention gap:** Cloudflare KV has no native backup. Recommended fix: weekly export cron that dumps each namespace to R2 (`funeralpress-images` bucket has a dedicated `kv-backups/` prefix is **not yet provisioned**).

**Escalation:** Cloudflare support — they retain deleted namespace data for a short window (undocumented; ask quickly).

---

### 3h. Memorial page disappears after a year (TTL expiry)

**Symptoms:** A memorial that was created roughly 12 months ago returns 404 from `memorial-api.funeralpress.org/<id>`.

**Diagnostics:** `workers/memorial-page-api.js` line 130 sets `expirationTtl: 365 * 24 * 60 * 60` on every KV write. Once expired, KV returns null and the API 404s. The D1 `memorials` table still has the row.

**Mitigation:**
1. Manually rehydrate the KV entry from D1:
   ```bash
   wrangler d1 execute funeralpress-db --command "SELECT * FROM memorials WHERE id='<id>';"
   ```
   then `wrangler kv key put` the JSON back into `MEMORIAL_PAGES_KV`.
2. **Long-term gap:** memorial pages are intended to be permanent but ship with a 1-year KV TTL. Recommended fix: remove the TTL on memorial KV writes, or add a touch-on-read pattern that re-puts after each `GET`.

---

## 4. Escalation matrix

| Issue type | Who to ping |
|------------|-------------|
| Cloudflare platform | Cloudflare support; status page |
| Paystack | `support@paystack.com`; their dashboard webhook log |
| Resend (email) | Resend support; verify DKIM |
| Twilio / Termii (SMS) | Provider dashboard; secrets in `auth-api` |
| Sentry | Sentry support |
| Code regression | Repo owner; `git log` + GitHub Actions; rollback per § Rollback |

---

## 5. Known gaps flagged by this runbook

1. **No reconciliation safety net active.** `RECONCILIATION_ENABLED = "false"` in `donation-api-wrangler.toml`. Webhook misses are not caught automatically.
2. **No manual trigger for `runDunningCron`.** If the daily run fails, you must wait 24h or redeploy.
3. **No KV backup automation.** `BROCHURES_KV` and `LIVE_SERVICE_KV` are single points of failure.
4. **No D1 cleanup cron.** `analytics_events`, `phone_otps`, `processed_webhooks` grow unboundedly.
5. **Memorial pages have a 1-year KV TTL but are sold as permanent.** Touch-on-read is not implemented.
6. **No status page.** Users have no canonical place to see incidents.
