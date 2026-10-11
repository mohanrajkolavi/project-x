import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// One connection per server process. Next.js dev reloads modules, so keep it on globalThis.
const g = globalThis as unknown as { __db?: Database.Database };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner','editor')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_sec TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT 'Explained',
  numeral TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  art TEXT NOT NULL DEFAULT 'bulb',
  palette TEXT NOT NULL DEFAULT 'lagoon',
  hero TEXT NOT NULL DEFAULT 'sky',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TEXT,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS posts_pub ON posts(status, published_at);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','unsubscribed')),
  token TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at TEXT,
  unsubscribed_at TEXT
);
CREATE INDEX IF NOT EXISTS subscribers_status ON subscribers(status);

CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  preheader TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sending','sent')),
  recipients INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  error TEXT,
  sent_at TEXT,
  opened_at TEXT,
  clicked_at TEXT
);
CREATE INDEX IF NOT EXISTS deliveries_campaign ON deliveries(campaign_id, status);

CREATE TABLE IF NOT EXISTS clicks (
  id INTEGER PRIMARY KEY,
  delivery_id TEXT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL,
  post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  referrer TEXT NOT NULL DEFAULT '',
  visitor TEXT NOT NULL,
  day TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS page_views_day ON page_views(day);
CREATE INDEX IF NOT EXISTS page_views_post ON page_views(post_id);

CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'issue',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

function open(): Database.Database {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "newsletter.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);
  return db;
}

export function db(): Database.Database {
  if (!g.__db) g.__db = open();
  return g.__db;
}

/** SQLite datetime string ("YYYY-MM-DD HH:MM:SS", UTC) for a JS date. */
export function sqlDate(d: Date = new Date()): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}
