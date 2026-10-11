import crypto from "node:crypto";
import { db } from "./db";

/** A per-install secret, made on first use, for signing links and hashing visitors. */
export function appSecret(): string {
  if (process.env.APP_SECRET) return process.env.APP_SECRET;
  const row = db().prepare("SELECT value FROM settings WHERE key = '_secret'").get() as { value: string } | undefined;
  if (row) return row.value;
  const v = crypto.randomBytes(32).toString("hex");
  db().prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('_secret', ?)").run(v);
  return (db().prepare("SELECT value FROM settings WHERE key = '_secret'").get() as { value: string }).value;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Stores a page view. Visitors are a daily salted hash, so nobody can be followed across days. */
export function recordView(input: { path: string; referrer: string; ip: string; ua: string }) {
  const day = today();
  const visitor = crypto.createHash("sha256").update(`${appSecret()}|${day}|${input.ip}|${input.ua}`).digest("hex").slice(0, 24);
  let postId: number | null = null;
  const m = input.path.match(/^\/issues\/([^/?#]+)/);
  if (m) {
    const p = db().prepare("SELECT id FROM posts WHERE slug = ?").get(decodeURIComponent(m[1])) as { id: number } | undefined;
    postId = p?.id ?? null;
  }
  let ref = "";
  try {
    if (input.referrer) ref = new URL(input.referrer).hostname.replace(/^www\./, "");
  } catch {}
  db()
    .prepare("INSERT INTO page_views (path, post_id, referrer, visitor, day) VALUES (?, ?, ?, ?, ?)")
    .run(input.path.slice(0, 300), postId, ref.slice(0, 120), visitor, day);
}

function days(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) out.push(new Date(d.getTime() - i * 864e5).toISOString().slice(0, 10));
  return out;
}

export type Series = { day: string; value: number }[];

export function viewsSeries(n = 30): { views: Series; visitors: Series } {
  const rows = db()
    .prepare("SELECT day, COUNT(*) v, COUNT(DISTINCT visitor) u FROM page_views WHERE day >= ? GROUP BY day")
    .all(days(n)[0]) as { day: string; v: number; u: number }[];
  const map = new Map(rows.map((r) => [r.day, r]));
  return {
    views: days(n).map((day) => ({ day, value: map.get(day)?.v ?? 0 })),
    visitors: days(n).map((day) => ({ day, value: map.get(day)?.u ?? 0 })),
  };
}

/** Active subscribers at the end of each day (joined and confirmed, not yet left). */
export function audienceSeries(n = 90): Series {
  return days(n).map((day) => {
    const end = `${day} 23:59:59`;
    const r = db()
      .prepare(
        `SELECT COUNT(*) n FROM subscribers WHERE COALESCE(confirmed_at, created_at) <= ? AND confirmed_at IS NOT NULL
         AND (unsubscribed_at IS NULL OR unsubscribed_at > ?)`,
      )
      .get(end, end) as { n: number };
    return { day, value: r.n };
  });
}

export function newSubscribers(sinceDays: number): number {
  return (
    db()
      .prepare("SELECT COUNT(*) n FROM subscribers WHERE confirmed_at >= datetime('now', ?) AND status = 'active'")
      .get(`-${sinceDays} days`) as { n: number }
  ).n;
}

export function lostSubscribers(sinceDays: number): number {
  return (
    db()
      .prepare("SELECT COUNT(*) n FROM subscribers WHERE unsubscribed_at >= datetime('now', ?)")
      .get(`-${sinceDays} days`) as { n: number }
  ).n;
}

export function totals(sinceDays: number) {
  const since = days(sinceDays)[0];
  const r = db().prepare("SELECT COUNT(*) v, COUNT(DISTINCT visitor || day) u FROM page_views WHERE day >= ?").get(since) as { v: number; u: number };
  return { views: r.v, visitors: r.u };
}

export function topPosts(sinceDays: number, limit = 5) {
  return db()
    .prepare(
      `SELECT p.id, p.title, p.slug, COUNT(v.id) views FROM page_views v JOIN posts p ON p.id = v.post_id
       WHERE v.day >= ? GROUP BY p.id ORDER BY views DESC LIMIT ?`,
    )
    .all(days(sinceDays)[0], limit) as { id: number; title: string; slug: string; views: number }[];
}

export function topReferrers(sinceDays: number, limit = 5) {
  return db()
    .prepare(
      `SELECT CASE WHEN referrer = '' THEN 'Direct' ELSE referrer END AS name, COUNT(*) views FROM page_views
       WHERE day >= ? GROUP BY name ORDER BY views DESC LIMIT ?`,
    )
    .all(days(sinceDays)[0], limit) as { name: string; views: number }[];
}

export function signupSources(limit = 5) {
  return db()
    .prepare(
      `SELECT CASE WHEN source = '' THEN 'Unknown' ELSE source END AS name, COUNT(*) n FROM subscribers
       WHERE status = 'active' GROUP BY name ORDER BY n DESC LIMIT ?`,
    )
    .all(limit) as { name: string; n: number }[];
}

/** Open and click rates over the last few finished sends. */
export function emailRates(lastN = 5): { openRate: number | null; clickRate: number | null; sends: number } {
  const r = db()
    .prepare(
      `SELECT COUNT(*) n, SUM(d.opened_at IS NOT NULL) o, SUM(d.clicked_at IS NOT NULL) c FROM deliveries d
       WHERE d.status = 'sent' AND d.campaign_id IN (SELECT id FROM campaigns WHERE status = 'sent' ORDER BY sent_at DESC LIMIT ?)`,
    )
    .get(lastN) as { n: number; o: number | null; c: number | null };
  const sends = (db().prepare("SELECT COUNT(*) n FROM (SELECT id FROM campaigns WHERE status = 'sent' ORDER BY sent_at DESC LIMIT ?)").get(lastN) as { n: number }).n;
  if (!r.n) return { openRate: null, clickRate: null, sends };
  return { openRate: (r.o ?? 0) / r.n, clickRate: (r.c ?? 0) / r.n, sends };
}
