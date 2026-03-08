-- Tweet queue for X auto-poster
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

CREATE INDEX IF NOT EXISTS idx_tweet_queue_status_priority ON tweet_queue (status, priority DESC, created_at ASC);
