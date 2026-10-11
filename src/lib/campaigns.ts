import crypto from "node:crypto";
import { db } from "./db";
import { activeSubscribers } from "./subscribers";
import { issueEmail, sendMail } from "./email";
import { postById, type Post } from "./posts";

export type Campaign = {
  id: number;
  post_id: number | null;
  subject: string;
  preheader: string;
  status: "draft" | "sending" | "sent";
  recipients: number;
  created_at: string;
  sent_at: string | null;
};

export type CampaignStats = Campaign & {
  post_title: string | null;
  post_slug: string | null;
  sent: number;
  failed: number;
  queued: number;
  opened: number;
  clicked: number;
};

const STATS_SQL = `
SELECT c.*, p.title AS post_title, p.slug AS post_slug,
  (SELECT COUNT(*) FROM deliveries d WHERE d.campaign_id = c.id AND d.status = 'sent') AS sent,
  (SELECT COUNT(*) FROM deliveries d WHERE d.campaign_id = c.id AND d.status = 'failed') AS failed,
  (SELECT COUNT(*) FROM deliveries d WHERE d.campaign_id = c.id AND d.status = 'queued') AS queued,
  (SELECT COUNT(*) FROM deliveries d WHERE d.campaign_id = c.id AND d.opened_at IS NOT NULL) AS opened,
  (SELECT COUNT(*) FROM deliveries d WHERE d.campaign_id = c.id AND d.clicked_at IS NOT NULL) AS clicked
FROM campaigns c LEFT JOIN posts p ON p.id = c.post_id`;

export function listCampaigns(): CampaignStats[] {
  return db().prepare(`${STATS_SQL} ORDER BY c.created_at DESC, c.id DESC`).all() as CampaignStats[];
}

export function campaignById(id: number): CampaignStats | null {
  return (db().prepare(`${STATS_SQL} WHERE c.id = ?`).get(id) as CampaignStats) ?? null;
}

export function createCampaign(postId: number, subject: string, preheader: string): number {
  const r = db().prepare("INSERT INTO campaigns (post_id, subject, preheader) VALUES (?, ?, ?)").run(postId, subject, preheader);
  return Number(r.lastInsertRowid);
}

export function updateCampaign(id: number, subject: string, preheader: string) {
  db().prepare("UPDATE campaigns SET subject = ?, preheader = ? WHERE id = ? AND status = 'draft'").run(subject, preheader, id);
}

export function deleteCampaign(id: number) {
  db().prepare("DELETE FROM campaigns WHERE id = ? AND status = 'draft'").run(id);
}

export function topLinks(campaignId: number) {
  return db()
    .prepare(
      `SELECT k.url, COUNT(*) AS clicks, COUNT(DISTINCT k.delivery_id) AS people FROM clicks k JOIN deliveries d ON d.id = k.delivery_id
       WHERE d.campaign_id = ? GROUP BY k.url ORDER BY clicks DESC LIMIT 10`,
    )
    .all(campaignId) as { url: string; clicks: number; people: number }[];
}

/** Queues one delivery per active subscriber and starts sending in the background. */
export function startSend(id: number): number {
  const c = campaignById(id);
  if (!c || c.status !== "draft") return 0;
  const subs = activeSubscribers();
  const ins = db().prepare("INSERT INTO deliveries (id, campaign_id, subscriber_id, email) VALUES (?, ?, ?, ?)");
  db().transaction(() => {
    for (const s of subs) ins.run(crypto.randomBytes(12).toString("base64url"), id, s.id, s.email);
    db().prepare("UPDATE campaigns SET status = 'sending', recipients = ? WHERE id = ?").run(subs.length, id);
  })();
  void drain(id);
  return subs.length;
}

const running = new Set<number>();

/** Works through queued deliveries a few at a time. Safe to call again after a restart. */
export async function drain(id: number) {
  if (running.has(id)) return;
  running.add(id);
  try {
    const c = campaignById(id);
    const post = c?.post_id ? postById(c.post_id) : null;
    if (!c || !post) return;
    const next = db().prepare(
      `SELECT d.id, d.email, s.token FROM deliveries d LEFT JOIN subscribers s ON s.id = d.subscriber_id
       WHERE d.campaign_id = ? AND d.status = 'queued' LIMIT 8`,
    );
    const ok = db().prepare("UPDATE deliveries SET status = 'sent', sent_at = datetime('now') WHERE id = ?");
    const bad = db().prepare("UPDATE deliveries SET status = 'failed', error = ? WHERE id = ?");
    for (;;) {
      const batch = next.all(id) as { id: string; email: string; token: string | null }[];
      if (!batch.length) break;
      await Promise.all(
        batch.map(async (d) => {
          try {
            const m = issueEmail(post as Post, { subject: c.subject, preheader: c.preheader, token: d.token ?? undefined, deliveryId: d.id });
            await sendMail({ ...m, to: d.email });
            ok.run(d.id);
          } catch (e) {
            bad.run(String((e as Error)?.message || e).slice(0, 300), d.id);
          }
        }),
      );
    }
    db().prepare("UPDATE campaigns SET status = 'sent', sent_at = datetime('now') WHERE id = ?").run(id);
  } finally {
    running.delete(id);
  }
}

/** Resumes sends left half-done by a restart. */
export function resumeSends() {
  const ids = db().prepare("SELECT id FROM campaigns WHERE status = 'sending'").all() as { id: number }[];
  for (const { id } of ids) void drain(id);
}

export function recordOpen(deliveryId: string) {
  db().prepare("UPDATE deliveries SET opened_at = COALESCE(opened_at, datetime('now')) WHERE id = ?").run(deliveryId);
}

export function recordClick(deliveryId: string, url: string) {
  const d = db().prepare("SELECT id FROM deliveries WHERE id = ?").get(deliveryId);
  if (!d) return;
  db().prepare("INSERT INTO clicks (delivery_id, url) VALUES (?, ?)").run(deliveryId, url.slice(0, 2000));
  // A click also proves the email was opened (images are often blocked).
  db()
    .prepare("UPDATE deliveries SET clicked_at = COALESCE(clicked_at, datetime('now')), opened_at = COALESCE(opened_at, datetime('now')) WHERE id = ?")
    .run(deliveryId);
}
