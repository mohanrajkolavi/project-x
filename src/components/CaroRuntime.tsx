"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type CaroApi = {
  init: (root?: ParentNode) => void;
  sky: (c: HTMLCanvasElement, o?: { seed?: number; density?: number; drift?: number }) => { destroy(): void; rebuild(): void };
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
export function loadCaro(): Promise<CaroApi> {
  if (!loading) loading = import("@/caro/bundle.js").then(() => window.Caro as CaroApi);
  return loading;
}

/** Wakes up Caro behaviour (word reveals, count-ups, copy buttons, orbits) after each navigation. */
export function CaroRuntime({ track = true }: { track?: boolean }) {
  const pathname = usePathname();
  useEffect(() => {
    let cancelled = false;
    loadCaro().then((Caro) => {
      if (cancelled) return;
      const root = document.querySelector("main") || document;
      Caro.init(root);
      // Long sections should not make readers wait: cap the staggered fade delays.
      root.querySelectorAll<HTMLElement>(".ck-fade").forEach((el) => {
        const d = parseFloat(el.style.transitionDelay || "0");
        if (d > 900) el.style.transitionDelay = "900ms";
      });
      root.querySelectorAll("[data-ck-reveal]").forEach((el) => el.setAttribute("data-ck-armed", ""));
      root.querySelectorAll("[data-ck-orbits]").forEach((el) => {
        if (el.querySelector(".ck-orbits")) return;
        const w = el.firstElementChild?.getBoundingClientRect().width || 200;
        Caro.orbits(el, { k: Math.max(0.6, Math.min(1.3, w / 260)) });
      });
    });
    if (track && !pathname.startsWith("/admin") && lastView !== pathname) {
      lastView = pathname;
      const body = JSON.stringify({ path: pathname, referrer: document.referrer });
      try {
        if (!navigator.sendBeacon?.("/api/track/view", new Blob([body], { type: "application/json" }))) throw 0;
      } catch {
        fetch("/api/track/view", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
      }
    }
    return () => {
      cancelled = true;
    };
  }, [pathname, track]);
  return null;
}

/** The fixed night sky. It follows the palette class on its ancestor. */
export function Sky({ palette, seed = 7 }: { palette: string; seed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sky = useRef<{ destroy(): void; rebuild(): void } | null>(null);
  useEffect(() => {
    let dead = false;
    loadCaro().then((Caro) => {
      if (dead || !ref.current) return;
      sky.current = Caro.sky(ref.current, { seed });
    });
    return () => {
      dead = true;
      sky.current?.destroy();
      sky.current = null;
    };
  }, [seed]);
  useEffect(() => {
    sky.current?.rebuild();
  }, [palette]);
  return <canvas ref={ref} className="ck-sky" aria-hidden="true" />;
}
