import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, sqlDate } from "./db";

export type User = { id: number; email: string; name: string; role: "owner" | "editor" };

const COOKIE = "mk_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function userCount(): number {
  return (db().prepare("SELECT COUNT(*) n FROM users").get() as { n: number }).n;
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  db().prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(sha256(token), userId, sqlDate(expires));
  db().prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !process.env.INSECURE_COOKIES,
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE id = ?").run(sha256(token));
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
    )
    .get(sha256(token)) as User | undefined;
  return row ?? null;
}

/** For pages and actions inside the admin: returns the user or sends them to sign in. */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect(userCount() === 0 ? "/admin/setup" : "/admin/login");
  return user;
}

export async function requireOwner(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin");
  return user;
}

// Small in-memory limiter for sign-in and sign-up forms (per process).
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}
