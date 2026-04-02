-- ============================================================
-- Migration: Venues Directory
-- Date: 2026-04-02
-- ============================================================

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT,
  address TEXT,
  phone TEXT,
  services TEXT DEFAULT '[]',
  rating REAL,
  source TEXT,
  verified INTEGER DEFAULT 0,
  lat REAL,
  lng REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_venues_region ON venues(region);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_verified ON venues(verified);
