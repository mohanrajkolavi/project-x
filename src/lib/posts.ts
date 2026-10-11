import { db, sqlDate } from "./db";

export * from "./content";
import type { Post } from "./content";

const LIVE = "status = 'published' AND published_at <= datetime('now')";

export function isLive(p: Pick<Post, "status" | "published_at">): boolean {
  return p.status === "published" && !!p.published_at && p.published_at <= sqlDate();
}

export function postState(p: Pick<Post, "status" | "published_at">): "Draft" | "Scheduled" | "Published" {
  if (p.status === "draft") return "Draft";
  return isLive(p) ? "Published" : "Scheduled";
}

export function tagList(p: Pick<Post, "tags">): string[] {
  return p.tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export function tagSlug(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "issue";
}

export function uniqueSlug(base: string, exceptId?: number): string {
  let slug = slugify(base);
  let n = 2;
  const taken = db().prepare("SELECT id FROM posts WHERE slug = ? AND id IS NOT ?");
  while (taken.get(slug, exceptId ?? null)) slug = `${slugify(base)}-${n++}`;
  return slug;
}

// ---------- public queries
export function livePosts(opts: { limit?: number; offset?: number; q?: string; tag?: string } = {}): Post[] {
  const where = [LIVE];
  const args: (string | number)[] = [];
  if (opts.q) {
    where.push("(title LIKE ? OR title_sec LIKE ? OR excerpt LIKE ? OR body LIKE ?)");
    const like = `%${opts.q}%`;
    args.push(like, like, like, like);
  }
  let rows = db()
    .prepare(`SELECT * FROM posts WHERE ${where.join(" AND ")} ORDER BY published_at DESC`)
    .all(...args) as Post[];
  if (opts.tag) rows = rows.filter((p) => tagList(p).some((t) => tagSlug(t) === opts.tag));
  const start = opts.offset ?? 0;
  return opts.limit ? rows.slice(start, start + opts.limit) : rows.slice(start);
}

export function livePostBySlug(slug: string): Post | null {
  return (db().prepare(`SELECT * FROM posts WHERE slug = ? AND ${LIVE}`).get(slug) as Post) ?? null;
}

export function liveCount(): number {
  return (db().prepare(`SELECT COUNT(*) n FROM posts WHERE ${LIVE}`).get() as { n: number }).n;
}

export function topics(): { name: string; slug: string; count: number }[] {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of livePosts()) {
    for (const t of tagList(p)) {
      const slug = tagSlug(t);
      const cur = map.get(slug) || { name: t, slug, count: 0 };
      cur.count++;
      map.set(slug, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function neighbours(p: Post): { newer: Post | null; older: Post | null } {
  const newer = db()
    .prepare(`SELECT * FROM posts WHERE ${LIVE} AND published_at > ? ORDER BY published_at ASC LIMIT 1`)
    .get(p.published_at) as Post | undefined;
  const older = db()
    .prepare(`SELECT * FROM posts WHERE ${LIVE} AND published_at < ? ORDER BY published_at DESC LIMIT 1`)
    .get(p.published_at) as Post | undefined;
  return { newer: newer ?? null, older: older ?? null };
}

// ---------- admin queries
export function allPosts(filter?: "draft" | "scheduled" | "published"): Post[] {
  const rows = db().prepare("SELECT * FROM posts ORDER BY COALESCE(published_at, updated_at) DESC").all() as Post[];
  if (!filter) return rows;
  return rows.filter((p) => postState(p).toLowerCase() === filter);
}

export function postById(id: number): Post | null {
  return (db().prepare("SELECT * FROM posts WHERE id = ?").get(id) as Post) ?? null;
}

export type PostInput = Omit<Post, "id" | "created_at" | "updated_at" | "author_id">;

export function insertPost(input: PostInput, authorId: number | null): number {
  const r = db()
    .prepare(
      `INSERT INTO posts (slug, title, title_sec, label, numeral, excerpt, body, tags, art, palette, hero, status, published_at, author_id)
       VALUES (@slug, @title, @title_sec, @label, @numeral, @excerpt, @body, @tags, @art, @palette, @hero, @status, @published_at, @author_id)`,
    )
    .run({ ...input, author_id: authorId });
  return Number(r.lastInsertRowid);
}

export function updatePost(id: number, input: PostInput) {
  db()
    .prepare(
      `UPDATE posts SET slug=@slug, title=@title, title_sec=@title_sec, label=@label, numeral=@numeral, excerpt=@excerpt,
       body=@body, tags=@tags, art=@art, palette=@palette, hero=@hero, status=@status, published_at=@published_at,
       updated_at=datetime('now') WHERE id=@id`,
    )
    .run({ ...input, id });
}

export function deletePost(id: number) {
  db().prepare("DELETE FROM posts WHERE id = ?").run(id);
}
