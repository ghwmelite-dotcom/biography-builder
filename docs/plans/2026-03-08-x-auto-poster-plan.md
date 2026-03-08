# X Auto-Poster Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Cloudflare Worker that auto-posts tweets to X from a D1 queue, fed by content creation events across FuneralPress.

**Architecture:** A `tweet_queue` D1 table stores pending tweets. Existing Workers (memorial, live-service) insert rows on content creation. A new `twitter-bot.js` Worker runs on a 12-hour cron, picks the highest-priority pending tweet, signs it with OAuth 1.0a, and posts to X API v2.

**Tech Stack:** Cloudflare Workers, D1 (SQLite), X API v2, OAuth 1.0a (HMAC-SHA1), Wrangler CLI

**Key context:**
- Memorial and live-service Workers are KV-only — they need a D1 binding added
- auth-api Worker already has D1 binding (`DB`)
- Domain is `funeralpress.org`
- Blog posts are static in `src/data/blogPosts.js`

---

### Task 1: Create the `tweet_queue` table in D1

**Files:**
- Create: `workers/migrations/0001_create_tweet_queue.sql`

**Step 1: Create the migration file**

```sql
-- workers/migrations/0001_create_tweet_queue.sql
CREATE TABLE IF NOT EXISTS tweet_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  tweet_id TEXT,
  error TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  posted_at TEXT
);

CREATE INDEX idx_tweet_queue_status_priority ON tweet_queue (status, priority DESC, created_at ASC);
```

**Step 2: Run the migration against D1**

```bash
npx wrangler d1 execute funeral-press-db --file=workers/migrations/0001_create_tweet_queue.sql --remote
```

Expected: "Executed 2 commands" (CREATE TABLE + CREATE INDEX)

**Step 3: Verify the table exists**

```bash
npx wrangler d1 execute funeral-press-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name='tweet_queue'" --remote
```

Expected: One row with `tweet_queue`

**Step 4: Commit**

```bash
git add workers/migrations/0001_create_tweet_queue.sql
git commit -m "feat: add tweet_queue D1 migration"
```

---

### Task 2: Build `twitter-bot.js` — OAuth 1.0a signing

**Files:**
- Create: `workers/twitter-bot.js`

**Step 1: Create the Worker with OAuth 1.0a signing**

The X API v2 requires OAuth 1.0a signatures. Since Cloudflare Workers have no Node.js `crypto`, we use `crypto.subtle` (Web Crypto API).

```js
// workers/twitter-bot.js

/**
 * Cloudflare Worker - Twitter/X Auto-Poster
 *
 * Cron Trigger: every 12 hours
 * Reads from tweet_queue (D1), posts to X API v2
 *
 * Secrets: TWITTER_API_KEY, TWITTER_API_SECRET,
 *          TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET
 * Bindings: DB (D1)
 */

// ─── OAuth 1.0a helpers (Web Crypto API) ────────────────────────────────────

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha1(key, data) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function buildOAuthHeader(method, url, body, env) {
  const oauthParams = {
    oauth_consumer_key: env.TWITTER_API_KEY,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: env.TWITTER_ACCESS_TOKEN,
    oauth_version: '1.0',
  };

  // Collect all params (oauth + body for form-encoded, but for JSON POST we only use oauth params)
  const allParams = { ...oauthParams };

  // Build signature base string
  const paramString = Object.keys(allParams)
    .sort()
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const baseString = `${method}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(env.TWITTER_API_SECRET)}&${percentEncode(env.TWITTER_ACCESS_TOKEN_SECRET)}`;

  oauthParams.oauth_signature = await hmacSha1(signingKey, baseString);

  // Build Authorization header
  const headerString = Object.keys(oauthParams)
    .sort()
    .map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerString}`;
}

// ─── X API v2 posting ───────────────────────────────────────────────────────

async function postTweet(text, env) {
  const url = 'https://api.twitter.com/2/tweets';
  const body = JSON.stringify({ text });
  const authHeader = await buildOAuthHeader('POST', url, body, env);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`X API error ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

// ─── Evergreen tips ─────────────────────────────────────────────────────────

const EVERGREEN_TIPS = [
  "Planning ahead can ease the burden on your loved ones. Start with a budget → funeralpress.org/budget-planner #FuneralPlanning #Ghana",
  "Did you know? FuneralPress supports 11+ professional brochure themes for funeral programmes. Explore them → funeralpress.org/themes #FuneralPlanning",
  "Create a lasting tribute with a memorial page your family and friends can share → funeralpress.org #FuneralPlanning #Ghana",
  "Design beautiful funeral invitations in minutes — no design skills needed → funeralpress.org #FuneralPlanning",
  "Keep track of important anniversaries with our free reminder tool → funeralpress.org/reminders #FuneralPlanning #Ghana",
  "Need a funeral order of service booklet? Design and download one in minutes → funeralpress.org #FuneralPlanning",
  "Share a live funeral service schedule with family near and far → funeralpress.org #FuneralPlanning #Ghana",
  "Create a digital guest book for mourners to leave tributes and messages → funeralpress.org #FuneralPlanning",
  "Design thank-you cards for those who supported you during a difficult time → funeralpress.org #FuneralPlanning #Ghana",
  "Browse 11,000+ hymns for your funeral service programme → funeralpress.org/hymns #FuneralPlanning",
  "Plan your funeral budget with our free interactive tool. No sign-up required → funeralpress.org/budget-planner #Ghana",
  "FuneralPress helps churches and funeral homes manage funeral designs for their communities → funeralpress.org #FuneralPlanning",
  "Create a photo collage to celebrate a life well lived → funeralpress.org #FuneralPlanning #Ghana",
  "Design professional funeral posters and banners in minutes → funeralpress.org #FuneralPlanning",
  "Print-ready funeral brochures delivered as high-quality PDFs → funeralpress.org #FuneralPlanning #Ghana",
  "Generate a QR code for your memorial page — perfect for printing on programmes → funeralpress.org/qr-cards #FuneralPlanning",
  "Find funeral venues near you in our Ghana venue directory → funeralpress.org/venues #FuneralPlanning #Ghana",
  "Preserve their memory with an online obituary page → funeralpress.org #FuneralPlanning",
  "FuneralPress works on any device — design on your phone, tablet, or computer → funeralpress.org #FuneralPlanning #Ghana",
  "Create cloth labels (Aseda) for your funeral ceremony → funeralpress.org #FuneralPlanning #Ghana",
];

// ─── Cron handler ───────────────────────────────────────────────────────────

async function handleScheduled(env) {
  // 1. Get next pending tweet
  const row = await env.DB.prepare(
    `SELECT * FROM tweet_queue WHERE status = 'pending' ORDER BY priority DESC, created_at ASC LIMIT 1`
  ).first();

  let tweetText;
  let queueId;

  if (row) {
    // Build tweet text: content + url
    tweetText = row.url ? `${row.content} ${row.url}` : row.content;
    queueId = row.id;
  } else {
    // No pending tweets — pick a random evergreen tip
    const tipIndex = Math.floor(Math.random() * EVERGREEN_TIPS.length);
    tweetText = EVERGREEN_TIPS[tipIndex];

    // Insert it into the queue for tracking
    const inserted = await env.DB.prepare(
      `INSERT INTO tweet_queue (source, content, priority, status) VALUES ('tip', ?, 1, 'pending')`
    ).bind(tweetText).run();
    queueId = inserted.meta.last_row_id;
  }

  // 2. Post to X
  try {
    const result = await postTweet(tweetText, env);
    const postedTweetId = result.data?.id || null;

    await env.DB.prepare(
      `UPDATE tweet_queue SET status = 'posted', tweet_id = ?, posted_at = datetime('now') WHERE id = ?`
    ).bind(postedTweetId, queueId).run();

    console.log(`Posted tweet ${postedTweetId}: ${tweetText.substring(0, 50)}...`);
  } catch (err) {
    await env.DB.prepare(
      `UPDATE tweet_queue SET status = 'failed', error = ? WHERE id = ?`
    ).bind(err.message, queueId).run();

    console.error(`Failed to post tweet ${queueId}: ${err.message}`);
  }
}

// ─── Worker export ──────────────────────────────────────────────────────────

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(env));
  },

  // Health check endpoint for manual testing
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      const pending = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM tweet_queue WHERE status = 'pending'`
      ).first();
      const posted = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM tweet_queue WHERE status = 'posted'`
      ).first();

      return new Response(JSON.stringify({
        status: 'ok',
        queue: { pending: pending.count, posted: posted.count },
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Manual trigger (protected — only for testing)
    if (url.pathname === '/trigger' && url.searchParams.get('key') === env.TRIGGER_KEY) {
      await handleScheduled(env);
      return new Response(JSON.stringify({ triggered: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
```

**Step 2: Verify the file was created correctly**

Read back `workers/twitter-bot.js` and confirm it has the `scheduled` export, OAuth helpers, and evergreen tips.

**Step 3: Commit**

```bash
git add workers/twitter-bot.js
git commit -m "feat: add twitter-bot Worker with OAuth 1.0a and X API v2"
```

---

### Task 3: Create wrangler config for twitter-bot

**Files:**
- Create: `workers/twitter-bot-wrangler.toml`

**Step 1: Create the wrangler config**

```toml
name = "twitter-bot"
main = "twitter-bot.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 */12 * * *"]

[[d1_databases]]
binding = "DB"
database_name = "funeral-press-db"
database_id = "<REPLACE_WITH_ACTUAL_DB_ID>"
```

Note: The actual `database_id` must be filled in from the Cloudflare dashboard or `wrangler d1 list`.

**Step 2: Commit**

```bash
git add workers/twitter-bot-wrangler.toml
git commit -m "feat: add wrangler config for twitter-bot cron Worker"
```

---

### Task 4: Add D1 binding and queue insertion to `memorial-page-api.js`

**Files:**
- Modify: `workers/memorial-page-api.js`

This Worker currently only uses KV. We need to add a D1 binding and insert a tweet after memorial creation.

**Step 1: Add tweet queue insertion after successful memorial save**

In `handlePost()`, after the successful KV put and before the return statement (after line 54), add:

```js
    // Queue anonymized tweet
    if (env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO tweet_queue (source, content, url, priority) VALUES (?, ?, ?, ?)`
        ).bind(
          'memorial',
          'A new memorial page has been created on FuneralPress. Honor their memory and leave a tribute \u2192',
          `https://funeralpress.org/memorial/${id}`,
          3
        ).run();
      } catch (e) {
        // Don't fail the memorial creation if tweet queue fails
        console.error('Tweet queue insert failed:', e.message);
      }
    }
```

**Step 2: Update the Worker's deployment docs at the top** to note the new D1 binding:

Add to the comment block: `5. Bind D1 database: DB -> funeral-press-db`

**Step 3: Commit**

```bash
git add workers/memorial-page-api.js
git commit -m "feat: queue tweet on memorial creation"
```

---

### Task 5: Add D1 binding and queue insertion to `live-service-api.js`

**Files:**
- Modify: `workers/live-service-api.js`

**Step 1: Add tweet queue insertion after successful live service save**

In `handlePost()`, after the successful KV put and before the return statement (after line 54), add:

```js
    // Queue anonymized tweet
    if (env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO tweet_queue (source, content, url, priority) VALUES (?, ?, ?, ?)`
        ).bind(
          'partner_event',
          'A funeral service has been organized through FuneralPress. View the live service details \u2192',
          `https://funeralpress.org/live-service/${id}`,
          5
        ).run();
      } catch (e) {
        console.error('Tweet queue insert failed:', e.message);
      }
    }
```

**Step 2: Update deployment docs** to note the D1 binding.

**Step 3: Commit**

```bash
git add workers/live-service-api.js
git commit -m "feat: queue tweet on live service creation"
```

---

### Task 6: Seed blog post tweets into the queue

**Files:**
- Create: `workers/scripts/seed-blog-tweets.sql`

**Step 1: Create seed script for existing blog posts**

```sql
-- Seed blog post tweets
INSERT INTO tweet_queue (source, content, url, priority) VALUES
  ('blog', 'New on the blog: FuneralPress Complete User Guide — All Features Explained', 'https://funeralpress.org/blog/funeralpress-complete-user-guide', 8);
```

**Step 2: Run the seed**

```bash
npx wrangler d1 execute funeral-press-db --file=workers/scripts/seed-blog-tweets.sql --remote
```

**Step 3: Verify**

```bash
npx wrangler d1 execute funeral-press-db --command="SELECT id, source, content FROM tweet_queue WHERE source='blog'" --remote
```

**Step 4: Commit**

```bash
git add workers/scripts/seed-blog-tweets.sql
git commit -m "feat: seed existing blog post tweets into queue"
```

---

### Task 7: Set up X API secrets and deploy

**No code files — operational steps only.**

**Step 1: Create X Developer App**

1. Go to https://developer.x.com/en/portal/dashboard
2. Create a new project/app
3. Set up OAuth 1.0a with Read and Write permissions
4. Generate API Key, API Secret, Access Token, Access Token Secret

**Step 2: Store secrets in Cloudflare**

```bash
cd workers
npx wrangler secret put TWITTER_API_KEY --config twitter-bot-wrangler.toml
npx wrangler secret put TWITTER_API_SECRET --config twitter-bot-wrangler.toml
npx wrangler secret put TWITTER_ACCESS_TOKEN --config twitter-bot-wrangler.toml
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET --config twitter-bot-wrangler.toml
npx wrangler secret put TRIGGER_KEY --config twitter-bot-wrangler.toml
```

**Step 3: Add D1 bindings to memorial and live-service Workers**

In the Cloudflare Dashboard, add the `DB` D1 binding (funeral-press-db) to:
- `brochure-memorial-api` Worker
- `brochure-live-service-api` Worker

Or update their wrangler configs if they have separate deployment scripts.

**Step 4: Deploy the twitter-bot Worker**

```bash
cd workers
npx wrangler deploy --config twitter-bot-wrangler.toml
```

**Step 5: Redeploy memorial and live-service Workers**

```bash
cd workers
npx wrangler deploy memorial-page-api.js --name brochure-memorial-api
npx wrangler deploy live-service-api.js --name brochure-live-service-api
```

---

### Task 8: Test end-to-end

**Step 1: Check the health endpoint**

```bash
curl https://twitter-bot.<your-account>.workers.dev/health
```

Expected: `{"status":"ok","queue":{"pending":1,"posted":0}}`

**Step 2: Trigger a manual test post**

```bash
curl "https://twitter-bot.<your-account>.workers.dev/trigger?key=<YOUR_TRIGGER_KEY>"
```

Expected: `{"triggered":true}` and a tweet appears on your X account.

**Step 3: Verify in D1**

```bash
npx wrangler d1 execute funeral-press-db --command="SELECT id, source, status, tweet_id, posted_at FROM tweet_queue ORDER BY id DESC LIMIT 5" --remote
```

Expected: The blog tweet row shows `status = 'posted'` with a valid `tweet_id`.

**Step 4: Test memorial integration**

Create a test memorial via the app and verify a new `pending` row appears in `tweet_queue`.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | D1 migration — create `tweet_queue` table | `workers/migrations/0001_create_tweet_queue.sql` |
| 2 | Build `twitter-bot.js` Worker | `workers/twitter-bot.js` |
| 3 | Wrangler config for twitter-bot | `workers/twitter-bot-wrangler.toml` |
| 4 | Memorial API → queue tweet insertion | `workers/memorial-page-api.js` |
| 5 | Live Service API → queue tweet insertion | `workers/live-service-api.js` |
| 6 | Seed existing blog post tweets | `workers/scripts/seed-blog-tweets.sql` |
| 7 | X API secrets + deploy all Workers | Operational (no code) |
| 8 | End-to-end testing | Operational (no code) |
