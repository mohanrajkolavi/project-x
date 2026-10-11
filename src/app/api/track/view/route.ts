import { recordView } from "@/lib/analytics";

const BOT = /bot|crawl|spider|slurp|preview|fetch|monitor|headless|lighthouse/i;

export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (BOT.test(ua) || req.headers.get("dnt") === "1") return new Response(null, { status: 204 });
    const body = (await req.json()) as { path?: string; referrer?: string };
    const p = String(body.path || "");
    if (!p.startsWith("/") || p.startsWith("/admin") || p.startsWith("/api")) return new Response(null, { status: 204 });
    let referrer = String(body.referrer || "");
    try {
      if (referrer && new URL(referrer).host === new URL(req.url).host) referrer = "";
    } catch {
      referrer = "";
    }
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
    recordView({ path: p, referrer, ip, ua });
  } catch {}
  return new Response(null, { status: 204 });
}
