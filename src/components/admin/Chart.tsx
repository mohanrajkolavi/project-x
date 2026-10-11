"use client";

import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";

type Point = { day: string; value: number };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const label = (day: string) => {
  const [, m, d] = day.split("-");
  return `${MONTHS[+m - 1]} ${+d}`;
};

/** A top value split into 4 whole, round steps (0, 50, 100, 150, 200). */
function niceMax(v: number) {
  const raw = Math.max(1, v / 4);
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  const step = Math.max(1, (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p);
  return step * 4;
}

/**
 * One series over time, on one axis. Line for running totals, bars for daily counts.
 * Hover or arrow keys move a crosshair; the readout above names the day and value.
 */
export function TimeChart({ data, kind, unit, extra }: { data: Point[]; kind: "line" | "bars"; unit: string; extra?: { name: string; data: Point[] } }) {
  const id = useId().replace(/:/g, "");
  const [i, setI] = useState<number | null>(null);
  const W = 600, H = 240, L = 44, R = 6, T = 12, B = 30;
  const max = niceMax(Math.max(1, ...data.map((d) => d.value), ...(extra?.data.map((d) => d.value) ?? [])));
  const iw = W - L - R, ih = H - T - B;
  const n = data.length;
  const step = iw / Math.max(1, kind === "bars" ? n : n - 1);
  const x = (k: number) => (kind === "bars" ? L + k * step + step / 2 : L + k * step);
  const y = (v: number) => T + ih - (v / max) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const path = (pts: Point[]) => pts.map((p, k) => `${k ? "L" : "M"}${x(k).toFixed(1)} ${y(p.value).toFixed(1)}`).join("");
  const every = Math.ceil(n / 6);
  const cur = i == null ? n - 1 : i;

  const move = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const k = Math.round(kind === "bars" ? (px - L - step / 2) / step : (px - L) / step);
    setI(Math.max(0, Math.min(n - 1, k)));
  };
  const key = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === "ArrowLeft") setI(Math.max(0, cur - 1));
    else if (e.key === "ArrowRight") setI(Math.min(n - 1, cur + 1));
    else if (e.key === "Home") setI(0);
    else if (e.key === "End") setI(n - 1);
    else return;
    e.preventDefault();
  };

  const p = data[cur];
  const fmt = (v: number) => v.toLocaleString("en-US");
  return (
    <div className="ad-chart">
      <p className="ad-chart-tip" aria-live="polite">
        <b>{fmt(p?.value ?? 0)}</b> {unit}
        {extra ? (
          <>
            {" · "}
            <b>{fmt(extra.data[cur]?.value ?? 0)}</b> {extra.name}
          </>
        ) : null}{" "}
        · {p ? label(p.day) : ""}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${unit} per day, ${label(data[0].day)} to ${label(data[n - 1].day)}. Use arrow keys to read each day.`}
        tabIndex={0}
        onPointerMove={move}
        onPointerLeave={() => setI(null)}
        onKeyDown={key}
        style={{ touchAction: "pan-y" }}
      >
        <defs>
          <linearGradient id={`g${id}`} x1={L} x2={W - R} y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "var(--pal-1)" }} />
            <stop offset="0.5" style={{ stopColor: "var(--pal-2)" }} />
            <stop offset="1" style={{ stopColor: "var(--pal-3)" }} />
          </linearGradient>
          <linearGradient id={`f${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--pal-2)", stopOpacity: 0.22 }} />
            <stop offset="1" style={{ stopColor: "var(--pal-3)", stopOpacity: 0.02 }} />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} opacity={t === 0 ? 1 : 0.5} />
            <text className="axis" x={L - 10} y={y(t) + 4} textAnchor="end">
              {t >= 1000 ? `${+(t / 1000).toFixed(1)}K` : +t.toFixed(1)}
            </text>
          </g>
        ))}
        {data.map((d, k) =>
          k % every === (n - 1) % every ? (
            <text key={d.day} className="axis" x={x(k)} y={H - 8} textAnchor="middle">
              {label(d.day)}
            </text>
          ) : null,
        )}
        {kind === "line" ? (
          <>
            <path d={`${path(data)}L${x(n - 1)} ${y(0)}L${x(0)} ${y(0)}Z`} fill={`url(#f${id})`} />
            <path className="line-glow" d={path(data)} stroke={`url(#g${id})`} />
            <path className="line" d={path(data)} stroke={`url(#g${id})`} />
          </>
        ) : (
          data.map((d, k) => {
            const bw = Math.max(2, step - 2);
            const h = Math.max(d.value ? 2 : 0, y(0) - y(d.value));
            const r = Math.min(4, bw / 2, h);
            const x0 = x(k) - bw / 2, y0 = y(0) - h;
            return (
              <path
                key={d.day}
                d={`M${x0} ${y(0)}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}H${x0 + bw - r}Q${x0 + bw} ${y0} ${x0 + bw} ${y0 + r}V${y(0)}Z`}
                fill={`url(#g${id})`}
                opacity={i == null || i === k ? 1 : 0.45}
              />
            );
          })
        )}
        {extra ? <path className="line-2" d={path(extra.data)} /> : null}
        {i != null ? (
          <>
            <line className="focus-line" x1={x(i)} x2={x(i)} y1={T} y2={y(0)} />
            {kind === "line" ? <circle className="focus-dot" cx={x(i)} cy={y(data[i].value)} r="5" /> : null}
          </>
        ) : null}
      </svg>
      {extra ? (
        <div className="ad-chart-legend">
          <span>
            <i /> {unit[0].toUpperCase() + unit.slice(1)}
          </span>
          <span>
            <i className="is-2" /> {extra.name[0].toUpperCase() + extra.name.slice(1)}
          </span>
        </div>
      ) : null}
      <details className="ad-details" style={{ marginTop: 16 }}>
        <summary>Show as a table</summary>
        <div className="ad-table-wrap" style={{ maxHeight: 280, overflow: "auto", marginTop: 12 }}>
          <table className="ad-table">
            <thead>
              <tr>
                <th>Day</th>
                <th className="num">{unit}</th>
                {extra ? <th className="num">{extra.name}</th> : null}
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d, k) => (
                <tr key={d.day}>
                  <td>{label(d.day)}</td>
                  <td className="num">{fmt(d.value)}</td>
                  {extra ? <td className="num">{fmt(extra.data[n - 1 - k]?.value ?? 0)}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
