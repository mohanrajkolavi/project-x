import crypto from "node:crypto";
import { db } from "./db";

export type Subscriber = {
  id: number;
  email: string;
  status: "pending" | "active" | "unsubscribed";
  token: string;
  source: string;
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function validEmail(e: string): boolean {
  return e.length <= 254 && EMAIL_RE.test(e);
}
export function normalEmail(e: string): string {
  return e.trim().toLowerCase();
}
const newToken = () => crypto.randomBytes(24).toString("base64url");

export function subscriberByEmail(email: string): Subscriber | null {
  return (db().prepare("SELECT * FROM subscribers WHERE email = ?").get(normalEmail(email)) as Subscriber) ?? null;
}
export function subscriberByToken(token: string): Subscriber | null {
  if (!token) return null;
  return (db().prepare("SELECT * FROM subscribers WHERE token = ?").get(token) as Subscriber) ?? null;
}

/**
 * Adds or re-subscribes an address. Returns the row and whether a confirmation email is needed.
 * An active address stays active; nothing about it is revealed to the caller beyond that.
 */
export function upsertSubscriber(email: string, source: string, doubleOptIn: boolean): { sub: Subscriber; needsConfirm: boolean } {
  const e = normalEmail(email);
  const existing = subscriberByEmail(e);
  const status = doubleOptIn ? "pending" : "active";
  if (!existing) {
    db()
      .prepare(
        `INSERT INTO subscribers (email, status, token, source, confirmed_at) VALUES (?, ?, ?, ?, ${doubleOptIn ? "NULL" : "datetime('now')"})`,
      )
      .run(e, status, newToken(), source.slice(0, 200));
    return { sub: subscriberByEmail(e)!, needsConfirm: doubleOptIn };
  }
  if (existing.status === "active") return { sub: existing, needsConfirm: false };
  db()
    .prepare(
      `UPDATE subscribers SET status = ?, unsubscribed_at = NULL, confirmed_at = ${doubleOptIn ? "confirmed_at" : "datetime('now')"} WHERE id = ?`,
    )
    .run(status, existing.id);
  return { sub: subscriberByEmail(e)!, needsConfirm: doubleOptIn };
}

export function confirmSubscriber(token: string): Subscriber | null {
  const s = subscriberByToken(token);
  if (!s) return null;
  if (s.status !== "active") {
    db().prepare("UPDATE subscribers SET status = 'active', confirmed_at = datetime('now'), unsubscribed_at = NULL WHERE id = ?").run(s.id);
  }
  return subscriberByToken(token);
}

export function unsubscribe(token: string): Subscriber | null {
  const s = subscriberByToken(token);
  if (!s) return null;
  if (s.status !== "unsubscribed") {
    db().prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = datetime('now') WHERE id = ?").run(s.id);
  }
  return subscriberByToken(token);
}

export function listSubscribers(opts: { q?: string; status?: string; limit: number; offset: number }) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.q) {
    where.push("email LIKE ?");
    args.push(`%${opts.q}%`);
  }
  if (opts.status && ["pending", "active", "unsubscribed"].includes(opts.status)) {
    where.push("status = ?");
    args.push(opts.status);
  }
  const w = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (db().prepare(`SELECT COUNT(*) n FROM subscribers ${w}`).get(...args) as { n: number }).n;
  const rows = db()
    .prepare(`SELECT * FROM subscribers ${w} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...args, opts.limit, opts.offset) as Subscriber[];
  return { total, rows };
}

export function subscriberCounts(): Record<"active" | "pending" | "unsubscribed" | "all", number> {
  const rows = db().prepare("SELECT status, COUNT(*) n FROM subscribers GROUP BY status").all() as { status: string; n: number }[];
  const c = { active: 0, pending: 0, unsubscribed: 0, all: 0 };
  for (const r of rows) {
    c[r.status as "active"] = r.n;
    c.all += r.n;
  }
  return c;
}

export function addSubscriberManually(email: string, source = "Added by admin"): "added" | "exists" | "invalid" {
  const e = normalEmail(email);
  if (!validEmail(e)) return "invalid";
  const existing = subscriberByEmail(e);
  if (existing?.status === "active") return "exists";
  upsertSubscriber(e, source, false);
  return "added";
}

export function deleteSubscriber(id: number) {
  db().prepare("DELETE FROM subscribers WHERE id = ?").run(id);
}

export function setSubscriberStatus(id: number, status: "active" | "unsubscribed") {
  if (status === "active") {
    db().prepare("UPDATE subscribers SET status='active', confirmed_at=COALESCE(confirmed_at, datetime('now')), unsubscribed_at=NULL WHERE id=?").run(id);
  } else {
    db().prepare("UPDATE subscribers SET status='unsubscribed', unsubscribed_at=datetime('now') WHERE id=?").run(id);
  }
}

export function importSubscribers(text: string): { added: number; skipped: number; invalid: number } {
  const res = { added: 0, skipped: 0, invalid: 0 };
  const found = text.match(/[^\s,;"'<>]+@[^\s,;"'<>]+/g) || [];
  const tx = db().transaction(() => {
    for (const raw of new Set(found.map(normalEmail))) {
      const r = addSubscriberManually(raw, "Imported");
      if (r === "added") res.added++;
      else if (r === "exists") res.skipped++;
      else res.invalid++;
    }
  });
  tx();
  return res;
}

export function activeSubscribers(): Subscriber[] {
  return db().prepare("SELECT * FROM subscribers WHERE status = 'active' ORDER BY id").all() as Subscriber[];
}
