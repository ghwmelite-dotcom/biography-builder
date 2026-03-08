# X (Twitter) Auto-Poster — Design Document

**Date**: 2026-03-08
**Status**: Approved

## Goal

Build an automated tweet posting system for FuneralPress that:
- Markets the platform (blog posts, feature announcements, tips)
- Syndicates partner/user content (memorials, obituaries, partner events)
- Posts 1-2 tweets/day on a consistent schedule
- Keeps memorial/obituary content anonymized (no personal details)

## Approach

**Queue-Based Worker with D1** — a Cloudflare Worker with a Cron Trigger that reads from a D1 tweet queue table and posts to X API v2.

## Architecture

```
Content Creation (existing Workers)
    ├── memorial-page-api.js  ──┐
    ├── live-service-api.js   ──┤
    ├── auth-api.js (partners)──┼──► INSERT into tweet_queue (D1)
    └── [manual/script: tips] ──┘

Cron Trigger (every 12h)
    └── twitter-bot.js Worker
        ├── SELECT next pending tweet from D1
        ├── POST to X API v2 (OAuth 1.0a)
        ├── UPDATE row as "posted"
        └── (skip if queue empty)
```

## Database Schema

```sql
CREATE TABLE tweet_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,         -- 'memorial', 'obituary', 'partner_event', 'blog', 'feature', 'tip'
  content TEXT NOT NULL,        -- tweet text (max 280 chars)
  url TEXT,                     -- link to include
  priority INTEGER DEFAULT 0,  -- higher = posted first
  status TEXT DEFAULT 'pending', -- 'pending', 'posted', 'failed'
  tweet_id TEXT,                -- X's tweet ID after posting
  error TEXT,                   -- error message if failed
  created_at TEXT DEFAULT (datetime('now')),
  posted_at TEXT
);
```

## Tweet Templates

| Source | Template |
|--------|----------|
| Memorial | "A new memorial page has been created on FuneralPress. Honor their memory and leave a tribute → {url}" |
| Obituary | "A life remembered. View this obituary on FuneralPress → {url}" |
| Partner event | "A funeral service has been organized through one of our partner institutions. View details → {url}" |
| Blog | "New on the blog: {title} — {url}" |
| Feature | "New feature: {description}. Try it now → {url}" |
| Tip | "{tip_text} #FuneralPlanning #Ghana" |

All memorial/obituary/partner tweets are **anonymized** — no names, no personal details.

## Priority Order

1. Feature announcements (priority 10)
2. Blog posts (priority 8)
3. Partner events (priority 5)
4. Memorials (priority 3)
5. Obituaries (priority 3)
6. Tips (priority 1) — evergreen filler when queue is empty

## Worker: `twitter-bot.js`

- **Cron**: `0 */12 * * *` (every 12 hours)
- **Auth**: X API v2 with OAuth 1.0a
- **Logic**:
  1. `SELECT * FROM tweet_queue WHERE status = 'pending' ORDER BY priority DESC, created_at ASC LIMIT 1`
  2. If no rows → backfill a random evergreen tip, then post it
  3. POST to `https://api.twitter.com/2/tweets`
  4. On success → update: `status = 'posted'`, `tweet_id`, `posted_at`
  5. On failure → update: `status = 'failed'`, `error`

## Integration Points

### memorial-page-api.js
After successful POST (memorial creation), insert:
```js
await env.DB.prepare(
  `INSERT INTO tweet_queue (source, content, url) VALUES (?, ?, ?)`
).bind(
  'memorial',
  'A new memorial page has been created on FuneralPress. Honor their memory and leave a tribute →',
  `https://funeralpress.com/memorial/${id}`
).run();
```

### live-service-api.js
After successful POST (service creation), insert a `partner_event` tweet.

### Blog posts
Seeded manually or via script into D1 when new blog content is added to `blogPosts.js`.

### Feature announcements
Inserted manually into D1 with priority 10.

## Evergreen Tips

~20-30 tips stored as a static array in `twitter-bot.js`, rotated into the queue when empty. Examples:
- "Planning ahead can ease the burden on your loved ones. Start with a budget → funeralpress.com/budget-planner"
- "Did you know? FuneralPress supports 11+ professional brochure themes for funeral programmes."
- "Create a lasting tribute with a memorial page your family can share → funeralpress.com"

## Wrangler Configuration

```toml
[env.production]
name = "twitter-bot"
main = "workers/twitter-bot.js"

[env.production.triggers]
crons = ["0 */12 * * *"]

[[env.production.d1_databases]]
binding = "DB"
database_name = "funeral-press-db"
database_id = "..."
```

## Secrets

Set via `wrangler secret put`:
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`

## Implementation Tasks

1. Create `tweet_queue` table in D1
2. Build `twitter-bot.js` Worker with OAuth 1.0a signing and X API v2 posting
3. Add evergreen tips array to the Worker
4. Add queue insertion to `memorial-page-api.js`
5. Add queue insertion to `live-service-api.js`
6. Add blog post seeding mechanism
7. Configure Cron Trigger in `wrangler.toml`
8. Set up Twitter API secrets
9. Test end-to-end with a test tweet
