// Server-rendered Caro marks, so pages look right before (and without) bundle.js.
import type { ReactNode } from "react";

function ray(a: number, l: number, w: number) {
  const t = (a * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
  return `M${(-s * w).toFixed(2)} ${(c * w).toFixed(2)}L${(c * l).toFixed(2)} ${(s * l).toFixed(2)}L${(s * w).toFixed(2)} ${(-c * w).toFixed(2)}Z`;
}
const WEBB_D =
  [90, 270, 30, 150, 210, 330].map((a) => ray(a, a === 90 || a === 270 ? 13 : 11, 1.15)).join("") + ray(0, 5.5, 0.9) + ray(180, 5.5, 0.9);

export function Webb() {
  return (
    <svg className="ck-webb" viewBox="-15 -15 30 30" aria-hidden="true">
      <circle className="ck-webb__glow" r="8" />
      <path className="ck-webb__rays" d={WEBB_D} />
      <circle className="ck-webb__core" r="2.6" />
    </svg>
  );
}

function Orbit({ size, moon = 140 }: { size: number; moon?: number }) {
  const c = size / 2, r = c - 1, a = (moon * Math.PI) / 180;
  const mx = +(c + r * Math.cos(a)).toFixed(1), my = +(c + r * Math.sin(a)).toFixed(1);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className="ck-planet__orbit" cx={c} cy={c} r={r} />
      <circle className="ck-planet__moon-cut" cx={mx} cy={my} r="6.5" />
      <circle className="ck-planet__moon" cx={mx} cy={my} r="3.5" />
    </svg>
  );
}

/** The "MK" planet avatar. */
export function Avatar() {
  return (
    <span className="ck-planet">
      <Orbit size={60} />
      <span className="ck-planet__sphere">
        <span className="ck-planet__mk">MK</span>
      </span>
    </span>
  );
}

/** The planet button sphere with a glyph inside. */
export function PlanetButton({ icon = "chevron" }: { icon?: IconName }) {
  return (
    <span className="ck-planet ck-planet--btn">
      <Orbit size={64} moon={-140} />
      <span className="ck-planet__sphere">
        <Icon name={icon} />
      </span>
    </span>
  );
}

export type IconName = "arrow" | "chevron" | "mail" | "down" | "copy" | "check";
const PATHS: Record<IconName, ReactNode> = {
  arrow: <path d="M4.5 12h14.5M13 5.75L19.25 12 13 18.25" />,
  chevron: <path d="M9 4.5L16.5 12 9 19.5" />,
  mail: (
    <>
      <rect x="3" y="5.25" width="18" height="13.5" rx="2.75" />
      <path d="M3.75 7.25L12 13l8.25-5.75" />
    </>
  ),
  down: <path d="M12 4.5v14.5M5.75 13L12 19.25 18.25 13" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.75a2.25 2.25 0 0 0-2.25-2.25h-6.5A2.25 2.25 0 0 0 4.5 6.75v6.5a2.25 2.25 0 0 0 2.25 2.25H8.5" />
    </>
  ),
  check: <path d="M6 12.5l4 4 8-9" />,
};
const WIDTH: Record<IconName, number> = { arrow: 2.5, chevron: 2.6, mail: 2.1, down: 2.4, copy: 2.1, check: 2.6 };

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={WIDTH[name]} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

/** Two-line headline: second line muted (or in the hero finish). */
export function Head({
  first,
  second,
  as: Tag = "h2",
  size = "headline",
  grad = false,
  words = true,
}: {
  first: ReactNode;
  second?: ReactNode;
  as?: "h1" | "h2" | "h3" | "p";
  size?: "display" | "headline" | "title";
  grad?: boolean;
  words?: boolean;
}) {
  return (
    <Tag className={`${size} ck-head`} {...(words ? { "data-ck-words": "" } : {})}>
      {first}
      {second ? (
        <>
          <br />
          <span className={grad ? "ck-grad" : "ck-sec"}>{second}</span>
        </>
      ) : null}
    </Tag>
  );
}
