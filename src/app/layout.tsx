import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import "@fontsource-variable/montserrat";
import "@/caro/tokens.css";
import "@/caro/bundle.css";
import "./globals.css";
import { CaroRuntime } from "@/components/CaroRuntime";
import { getSettings, baseUrl } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const s = getSettings();
  return {
    metadataBase: new URL(baseUrl(s)),
    title: { default: s.siteName, template: `%s · ${s.siteName}` },
    description: s.siteDescription,
    alternates: { types: { "application/rss+xml": "/feed.xml" } },
    icons: { icon: "/brand/planet-avatar-mk.svg" },
    openGraph: { siteName: s.siteName, type: "website" },
  };
}

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

// Hides reveal blocks until Caro has armed them, so words rise instead of flashing. Falls back after 2.5s.
const EARLY = `document.documentElement.classList.add('ck-js');setTimeout(function(){document.documentElement.classList.add('ck-late')},2500);`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <html lang="en" data-theme="black" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: EARLY }} />
      </head>
      <body>
        {children}
        <CaroRuntime />
      </body>
    </html>
  );
}
