const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** SQLite UTC datetime → Date. */
export function parseSql(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(s.replace(" ", "T") + (s.length <= 10 ? "T00:00:00Z" : "Z"));
}

/** "Sep 22", or "Sep 22, 2025" outside the current year. */
export function shortDate(s: string | null | undefined): string {
  const d = parseSql(s);
  if (!d) return "";
  const base = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  return d.getUTCFullYear() === new Date().getUTCFullYear() ? base : `${base}, ${d.getUTCFullYear()}`;
}

export function longDate(s: string | null | undefined): string {
  const d = parseSql(s);
  if (!d) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function monthKey(s: string | null | undefined): string {
  const d = parseSql(s);
  if (!d) return "";
  return `${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function dayLabel(day: string): string {
  const d = parseSql(day)!;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function dateTime(s: string | null | undefined): string {
  const d = parseSql(s);
  if (!d) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${shortDate(s)} · ${hh}:${mm} UTC`;
}

/** "980", "1.2K", "100K", "1M". */
export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1e6) return `${+(n / 1e3).toFixed(n < 1e4 ? 1 : 0)}K`;
  return `${+(n / 1e6).toFixed(1)}M`;
}

export function pct(r: number | null): string {
  if (r == null) return "None yet";
  const v = r * 100;
  return `${v >= 10 || v === 0 ? Math.round(v) : v.toFixed(1)}%`;
}

export function plural(n: number, one: string, many = one + "s"): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Value for <input type="datetime-local"> from a SQLite UTC string, in UTC. */
export function toLocalInput(s: string | null | undefined): string {
  const d = parseSql(s);
  return d ? d.toISOString().slice(0, 16) : "";
}
