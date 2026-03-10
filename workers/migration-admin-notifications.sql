CREATE TABLE IF NOT EXISTS admin_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT DEFAULT '{}',
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_admin_notif_unread ON admin_notifications (is_read, created_at DESC);
CREATE INDEX idx_admin_notif_type ON admin_notifications (type, created_at DESC);
