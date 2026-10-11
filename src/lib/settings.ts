import { db } from "./db";

export type Settings = {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  handle: string;
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: string;
  doubleOptIn: string;
  about: string;
};

export const DEFAULT_ABOUT = `#### About
## Plain words about AI. / Every week.

I write one email a week about AI. It covers the news worth knowing, the tools worth trying, prompts you can copy and links to skills.

Every issue teaches one thing from A to Z. What it is, why it matters, how it works and what to do next.

---

#### What you get
## One email. / Four parts.

\`\`\`rows
News | What changed | yes
Tech | How it works
Prompts | Ready to copy | yes
Skills | Links to learn
\`\`\`

---

#### The rules
## No hype. / No spam.

\`\`\`steps
Explain every term in plain words
Show the catch next to the upside
Send once a week, never more
Let you leave with one click
\`\`\`
`;

const DEFAULTS: Settings = {
  siteName: "@mohanrajkolavi",
  siteDescription: "AI news, tech, prompts and links to skills. In your inbox every week.",
  siteUrl: "",
  handle: "@mohanrajkolavi",
  fromName: "Mohanraj Kolavi",
  fromEmail: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpSecure: "false",
  doubleOptIn: "true",
  about: DEFAULT_ABOUT,
};

// Environment variables win over stored values so secrets can live outside the database.
const ENV: Partial<Record<keyof Settings, string>> = {
  siteUrl: "SITE_URL",
  fromEmail: "MAIL_FROM",
  smtpHost: "SMTP_HOST",
  smtpPort: "SMTP_PORT",
  smtpUser: "SMTP_USER",
  smtpPass: "SMTP_PASS",
  smtpSecure: "SMTP_SECURE",
};

export function getSettings(): Settings {
  const rows = db().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const s: Settings = { ...DEFAULTS };
  for (const r of rows) if (r.key in s) s[r.key as keyof Settings] = r.value;
  for (const [k, env] of Object.entries(ENV)) {
    const v = process.env[env!];
    if (v) s[k as keyof Settings] = v;
  }
  return s;
}

/** Keys that are currently set by the environment (shown read-only in the admin). */
export function envLocked(): (keyof Settings)[] {
  return (Object.entries(ENV) as [keyof Settings, string][]).filter(([, e]) => !!process.env[e]).map(([k]) => k);
}

export function saveSettings(patch: Partial<Settings>) {
  const stmt = db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  const tx = db().transaction((p: Partial<Settings>) => {
    for (const [k, v] of Object.entries(p)) if (k in DEFAULTS && v !== undefined) stmt.run(k, v);
  });
  tx(patch);
}

/** Absolute base URL for links in emails and feeds. */
export function baseUrl(s: Settings = getSettings()): string {
  return (s.siteUrl || process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
