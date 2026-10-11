import fs from "node:fs/promises";
import path from "node:path";
import { ART, PALETTES } from "@/lib/posts";

// Art ships in the lagoon palette. Other palettes are made by mapping every colour
// along the lagoon gradient to the same point on the chosen palette's gradient.
const STOPS: Record<string, string[]> = {
  lagoon: ["#7FE3FF", "#2E9BFF", "#5E5CE6"],
  aurora: ["#6EE7C8", "#4DA3FF", "#9D8CFF"],
  orchid: ["#7DD3FC", "#8B8CFF", "#E57AF5"],
  electric: ["#45B0FF", "#4F5BFF", "#B45CFF"],
  twilight: ["#4DA3FF", "#A5A0FF", "#FF5E8A"],
};
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
function at(stops: number[][], t: number) {
  const x = Math.max(0, Math.min(1, t)) * 2, k = Math.min(1, Math.floor(x)), f = x - k;
  return stops[k].map((v, i) => v + (stops[k + 1][i] - v) * f);
}
function recolor(svg: string, pal: string): string {
  const from = STOPS.lagoon.map(hex), to = STOPS[pal].map(hex);
  const cache = new Map<string, string>();
  return svg.replace(/#[0-9A-Fa-f]{6}\b/g, (h) => {
    const key = h.toUpperCase();
    if (cache.has(key)) return cache.get(key)!;
    const c = hex(key);
    // Find the closest point on the lagoon gradient; leave neutrals (white, black) alone.
    let best = 0, bestD = Infinity;
    for (let i = 0; i <= 200; i++) {
      const p = at(from, i / 200), d = Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]);
      if (d < bestD) { bestD = d; best = i / 200; }
    }
    const out = bestD < 40 ? toHex(at(to, best)) : key;
    cache.set(key, out);
    return out;
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const name = file.replace(/\.svg$/, "");
  if (!(ART as readonly string[]).includes(name)) return new Response("Not found", { status: 404 });
  const pal = new URL(req.url).searchParams.get("pal") || "lagoon";
  const palette = (PALETTES as readonly string[]).includes(pal) ? pal : "lagoon";
  let svg = await fs.readFile(path.join(process.cwd(), "design-system", "assets", "Art", `${name}.svg`), "utf8");
  if (palette !== "lagoon") svg = recolor(svg, palette);
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}
