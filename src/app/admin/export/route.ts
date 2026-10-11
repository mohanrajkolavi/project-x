import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote everything and defuse spreadsheet formulas.
  return `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await currentUser())) return new Response("Sign in first", { status: 401 });
  const status = new URL(req.url).searchParams.get("status");
  const ok = status && ["active", "pending", "unsubscribed"].includes(status);
  const rows = db()
    .prepare(`SELECT email, status, source, created_at, confirmed_at, unsubscribed_at FROM subscribers ${ok ? "WHERE status = ?" : ""} ORDER BY created_at`)
    .all(...(ok ? [status] : [])) as Record<string, unknown>[];
  const head = ["email", "status", "source", "created_at", "confirmed_at", "unsubscribed_at"];
  const csv = [head.join(","), ...rows.map((r) => head.map((h) => cell(r[h])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
