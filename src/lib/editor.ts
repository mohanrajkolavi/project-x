import { db } from "./db";
import { PAIRINGS } from "./posts";

/** Suggests a palette pairing different from the latest issue, so neighbouring pages differ. */
export function lastPairing(): number {
  const last = db().prepare("SELECT palette, hero FROM posts ORDER BY created_at DESC, id DESC LIMIT 1").get() as { palette: string; hero: string } | undefined;
  if (!last) return 0;
  const i = PAIRINGS.findIndex((p) => p.palette === last.palette && p.hero === last.hero);
  return (i + 1) % PAIRINGS.length;
}
