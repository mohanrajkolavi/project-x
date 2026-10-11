"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type CaroApi = {
  init: (root?: ParentNode) => void;
  sky: (c: HTMLCanvasElement, o?: { seed?: number; density?: number; drift?: number; still?: boolean }) => { destroy(): void; rebuild(): void };
  orbits: (el: Element, o?: { k?: number }) => { destroy(): void };
  reveal: (root?: ParentNode) => void;
};
declare global {
  interface Window {
    Caro?: CaroApi;
  }
}

let loading: Promise<CaroApi> | null = null;
let lastView = "";
/** Loads the Caro helpers on demand (the admin preview and the sky use them; reading pages don't). */
export function loadCaro(): Promise<CaroApi> {
  if (!loading) loading = import("@/caro/bundle.js").then(() => window.Caro as CaroApi);
  return loading;
}

/** The only script reading pages need: a page-view beacon and the prompt copy buttons. */
export function CaroRuntime({ track = true }: { track?: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element | null)?.closest?.("[data-ck-copy]");
      if (!btn) return;
      const text = btn.closest(".ck-prompt")?.querySelector(".ck-prompt__text");
      const label = btn.querySelector("span:last-child");
      if (!text) return;
      const done = () => {
        if (!label) return;
        label.textContent = "Copied";
        setTimeout(() => (label.textContent = "Copy"), 1600);
      };
      const select = () => {
        const r = document.createRange();
        r.selectNodeContents(text);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      };
      navigator.clipboard?.writeText(text.textContent?.trim() || "").then(done, select) ?? select();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!track || pathname.startsWith("/admin") || lastView === pathname) return;
    lastView = pathname;
    const body = JSON.stringify({ path: pathname, referrer: document.referrer });
    try {
      if (!navigator.sendBeacon?.("/api/track/view", new Blob([body], { type: "application/json" }))) throw 0;
    } catch {
      fetch("/api/track/view", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
    }
  }, [pathname, track]);
  return null;
}

/** The Caro night sky, drawn once (no animation loop). Fills its positioned parent unless fixed. */
export function Sky({ palette, seed = 7, fixed = false }: { palette: string; seed?: number; fixed?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let dead = false;
    let sky: { destroy(): void } | null = null;
    const start = () =>
      loadCaro().then((Caro) => {
        if (!dead && ref.current) sky = Caro.sky(ref.current, { seed, still: true });
      });
    // Draw after the page is idle so it never competes with reading.
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback;
    if (ric) ric(start);
    else setTimeout(start, 200);
    return () => {
      dead = true;
      sky?.destroy();
    };
  }, [seed, palette]);
  return <canvas ref={ref} className={fixed ? "ck-sky" : "ck-sky ck-sky--contained"} aria-hidden="true" />;
}
