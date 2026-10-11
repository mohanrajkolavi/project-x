import { db } from "@/lib/db";
import { recordClick } from "@/lib/campaigns";
import { baseUrl } from "@/lib/settings";

// Click counter for links in sent issues. It only forwards for real deliveries,
// so strangers can't use it as an open redirect.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const d = url.searchParams.get("d") || "";
  const base = baseUrl();
  let target = "";
  try {
    const t = new URL(url.searchParams.get("u") || "");
    if (t.protocol === "http:" || t.protocol === "https:") target = t.toString();
  } catch {}
  const known = !!d && !!db().prepare("SELECT 1 FROM deliveries WHERE id = ?").get(d);
  if (!known || !target) return Response.redirect(base, 302);
  try {
    recordClick(d, target);
  } catch {}
  return Response.redirect(target, 302);
}
