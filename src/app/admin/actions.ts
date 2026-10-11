"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, sqlDate } from "@/lib/db";
import {
  createSession, destroySession, hashPassword, rateLimited, requireOwner, requireUser, userCount, verifyPassword,
} from "@/lib/auth";
import {
  ART, LABELS, PAIRINGS, deletePost, insertPost, postById, uniqueSlug, updatePost, slugify, type PostInput,
} from "@/lib/posts";
import { renderWeb } from "@/lib/markdown";
import {
  addSubscriberManually, deleteSubscriber, importSubscribers, setSubscriberStatus,
} from "@/lib/subscribers";
import { createCampaign, deleteCampaign, startSend, updateCampaign, campaignById } from "@/lib/campaigns";
import { issueEmail, sendMail, smtpReady } from "@/lib/email";
import { saveSettings, type Settings } from "@/lib/settings";
import { seedDemo, seedSamples } from "@/lib/seed";

export type FormState = { ok?: boolean; error?: string; message?: string } | null;

const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
}

// ---------- auth
export async function signIn(_p: FormState, f: FormData): Promise<FormState> {
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") || "");
  if (rateLimited(`login:${await clientIp()}`, 10, 15 * 60_000)) return { error: "Too many tries. Wait 15 minutes, then try again." };
  const u = db().prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as { id: number; password_hash: string } | undefined;
  if (!u || !verifyPassword(password, u.password_hash)) return { error: "That email and password don’t match." };
  await createSession(u.id);
  const next = str(f, "next");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function setupOwner(_p: FormState, f: FormData): Promise<FormState> {
  if (userCount() > 0) redirect("/admin/login");
  const name = str(f, "name", 80);
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") || "");
  if (!name) return { error: "Add your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email doesn’t look right." };
  if (password.length < 10) return { error: "Use at least 10 characters for the password." };
  const r = db().prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'owner')").run(email, name, hashPassword(password));
  const id = Number(r.lastInsertRowid);
  if (f.get("samples")) seedSamples(id);
  if (f.get("demo")) seedDemo();
  saveSettings({ fromName: name });
  await createSession(id);
  redirect("/admin");
}

export async function signOut() {
  await destroySession();
  redirect("/admin/login");
}

// ---------- posts
function readPost(f: FormData, id?: number): PostInput | string {
  const title = str(f, "title", 160);
  if (!title) return "Add a title.";
  const pairing = PAIRINGS[parseInt(str(f, "pairing"), 10)] || PAIRINGS[0];
  const art = (ART as readonly string[]).includes(str(f, "art")) ? str(f, "art") : "bulb";
  const status = str(f, "status") === "published" ? "published" : "draft";
  let published_at: string | null = null;
  const when = str(f, "published_at_utc");
  if (when) {
    const d = new Date(when);
    if (isNaN(d.getTime())) return "That publish date doesn’t look right.";
    published_at = sqlDate(d);
  } else if (status === "published") published_at = sqlDate();
  const slugIn = str(f, "slug", 90);
  return {
    slug: uniqueSlug(slugIn ? slugify(slugIn) : title, id),
    title,
    title_sec: str(f, "title_sec", 160),
    label: str(f, "label", 40) || LABELS[0],
    numeral: str(f, "numeral", 4),
    excerpt: str(f, "excerpt", 400),
    body: String(f.get("body") ?? "").slice(0, 200_000),
    tags: str(f, "tags", 300)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(", "),
    art,
    palette: pairing.palette,
    hero: pairing.hero,
    status,
    published_at,
  };
}

export async function savePost(_p: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = parseInt(str(f, "id"), 10) || undefined;
  const input = readPost(f, id);
  if (typeof input === "string") return { error: input };
  let postId = id;
  if (id) {
    if (!postById(id)) return { error: "This issue no longer exists." };
    updatePost(id, input);
  } else {
    postId = insertPost(input, user.id);
  }
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/posts/${postId}?saved=1`);
  return { ok: true, message: input.status === "published" ? "Saved and live." : "Draft saved." };
}

export async function removePost(f: FormData) {
  await requireUser();
  deletePost(parseInt(str(f, "id"), 10));
  revalidatePath("/", "layout");
  redirect("/admin/posts?deleted=1");
}

export async function previewBody(body: string, palette: string): Promise<string> {
  await requireUser();
  return renderWeb(String(body).slice(0, 200_000), palette).replace(/ data-ck-reveal/g, "");
}

// ---------- sends
export async function newSend(f: FormData) {
  await requireUser();
  const post = postById(parseInt(str(f, "post_id"), 10));
  if (!post) redirect("/admin/sends?error=pick");
  const subject = [post.title, post.title_sec].filter(Boolean).join(" ");
  const id = createCampaign(post.id, subject, post.excerpt.slice(0, 140));
  redirect(`/admin/sends/${id}`);
}

export async function saveSend(_p: FormState, f: FormData): Promise<FormState> {
  await requireUser();
  const id = parseInt(str(f, "id"), 10);
  const subject = str(f, "subject", 200);
  if (!subject) return { error: "Add a subject line." };
  updateCampaign(id, subject, str(f, "preheader", 200));
  revalidatePath(`/admin/sends/${id}`);
  return { ok: true, message: "Saved." };
}

export async function sendTest(_p: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser();
  const c = campaignById(parseInt(str(f, "id"), 10));
  const post = c?.post_id ? postById(c.post_id) : null;
  if (!c || !post) return { error: "This send has no issue attached." };
  const to = str(f, "to") || user.email;
  try {
    const where = await sendMail({ ...issueEmail(post, { subject: `[Test] ${c.subject}`, preheader: c.preheader }), to });
    return { ok: true, message: where === "sent" ? `Test sent to ${to}.` : `No mail server set, so the test is in the outbox.` };
  } catch (e) {
    return { error: `The mail server said: ${(e as Error).message}` };
  }
}

export async function sendNow(f: FormData) {
  await requireUser();
  const id = parseInt(str(f, "id"), 10);
  if (str(f, "confirm") !== "send") redirect(`/admin/sends/${id}?error=confirm`);
  startSend(id);
  redirect(`/admin/sends/${id}?started=1`);
}

export async function removeSend(f: FormData) {
  await requireUser();
  deleteCampaign(parseInt(str(f, "id"), 10));
  redirect("/admin/sends");
}

// ---------- subscribers
export async function addSubscriber(_p: FormState, f: FormData): Promise<FormState> {
  await requireUser();
  const r = addSubscriberManually(str(f, "email"));
  revalidatePath("/admin/subscribers");
  if (r === "invalid") return { error: "That email doesn’t look right." };
  if (r === "exists") return { error: "That address is already subscribed." };
  return { ok: true, message: "Added as active." };
}

export async function importList(_p: FormState, f: FormData): Promise<FormState> {
  await requireUser();
  let text = str(f, "list", 2_000_000);
  const file = f.get("file");
  if (file && typeof file === "object" && "text" in file && (file as File).size) text += "\n" + (await (file as File).text()).slice(0, 5_000_000);
  if (!text.trim()) return { error: "Paste some addresses or pick a CSV file." };
  const r = importSubscribers(text);
  revalidatePath("/admin/subscribers");
  return { ok: true, message: `Added ${r.added}. Skipped ${r.skipped} already on the list${r.invalid ? ` and ${r.invalid} invalid` : ""}.` };
}

export async function subscriberAction(f: FormData) {
  await requireUser();
  const id = parseInt(str(f, "id"), 10);
  const op = str(f, "op");
  if (op === "delete") deleteSubscriber(id);
  if (op === "activate") setSubscriberStatus(id, "active");
  if (op === "unsubscribe") setSubscriberStatus(id, "unsubscribed");
  revalidatePath("/admin/subscribers");
}

// ---------- settings
const SETTING_KEYS: (keyof Settings)[] = [
  "siteName", "siteDescription", "siteUrl", "handle", "fromName", "fromEmail", "smtpHost", "smtpPort", "smtpUser", "smtpSecure", "about",
];

export async function saveSettingsAction(_p: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const patch: Partial<Settings> = {};
  for (const k of SETTING_KEYS) if (f.has(k)) patch[k] = String(f.get(k) ?? "").trim().slice(0, k === "about" ? 50_000 : 500);
  patch.smtpSecure = f.get("smtpSecure") ? "true" : "false";
  patch.doubleOptIn = f.get("doubleOptIn") ? "true" : "false";
  const pass = String(f.get("smtpPass") || "");
  if (pass) patch.smtpPass = pass;
  if (f.get("clearPass")) patch.smtpPass = "";
  if (patch.siteUrl && !/^https?:\/\//.test(patch.siteUrl)) return { error: "The site address must start with https:// or http://." };
  saveSettings(patch);
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

export async function testMail(_p: FormState): Promise<FormState> {
  const user = await requireOwner();
  if (!smtpReady()) return { error: "Add a mail server and a from address first." };
  try {
    await sendMail({
      to: user.email,
      subject: "Mail server test",
      html: "<p>Your mail server works. Newsletter emails will go out from here.</p>",
      text: "Your mail server works. Newsletter emails will go out from here.",
      kind: "test",
    });
    return { ok: true, message: `Test sent to ${user.email}.` };
  } catch (e) {
    return { error: `The mail server said: ${(e as Error).message}` };
  }
}

export async function clearOutbox() {
  await requireOwner();
  db().prepare("DELETE FROM outbox").run();
  redirect("/admin/outbox");
}

// ---------- team
export async function addMember(_p: FormState, f: FormData): Promise<FormState> {
  await requireOwner();
  const name = str(f, "name", 80);
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") || "");
  const role = str(f, "role") === "owner" ? "owner" : "editor";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Add a name and a valid email." };
  if (password.length < 10) return { error: "Use at least 10 characters for the password." };
  try {
    db().prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)").run(email, name, hashPassword(password), role);
  } catch {
    return { error: "Someone with that email is already on the team." };
  }
  revalidatePath("/admin/team");
  return { ok: true, message: `${name} can now sign in.` };
}

export async function removeMember(f: FormData) {
  const me = await requireOwner();
  const id = parseInt(str(f, "id"), 10);
  if (id === me.id) redirect("/admin/team?error=self");
  db().prepare("DELETE FROM users WHERE id = ?").run(id);
  revalidatePath("/admin/team");
}

export async function changePassword(_p: FormState, f: FormData): Promise<FormState> {
  const me = await requireUser();
  const cur = String(f.get("current") || "");
  const next = String(f.get("next") || "");
  const row = db().prepare("SELECT password_hash FROM users WHERE id = ?").get(me.id) as { password_hash: string };
  if (!verifyPassword(cur, row.password_hash)) return { error: "Your current password isn’t right." };
  if (next.length < 10) return { error: "Use at least 10 characters for the new password." };
  db().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(next), me.id);
  db().prepare("DELETE FROM sessions WHERE user_id = ?").run(me.id);
  await createSession(me.id);
  return { ok: true, message: "Password changed. Other devices are signed out." };
}
