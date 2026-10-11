import { unsubscribe } from "@/lib/subscribers";

// One-click unsubscribe (RFC 8058): mail apps POST here straight from the inbox.
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  unsubscribe(token);
  return new Response("Unsubscribed", { status: 200 });
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  return Response.redirect(new URL(`/unsubscribe?token=${encodeURIComponent(token)}`, req.url), 302);
}
