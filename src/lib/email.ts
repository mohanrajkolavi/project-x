import nodemailer, { type Transporter } from "nodemailer";
import { db } from "./db";
import { getSettings, baseUrl, type Settings } from "./settings";
import { esc, renderEmail, renderText } from "./markdown";
import { readMinutes, type Post } from "./content";

export type Mail = { to: string; subject: string; html: string; text: string; kind: string; headers?: Record<string, string> };

export function smtpReady(s: Settings = getSettings()): boolean {
  return !!(s.smtpHost && s.fromEmail);
}

let cached: { key: string; t: Transporter } | null = null;
function transport(s: Settings) {
  const key = [s.smtpHost, s.smtpPort, s.smtpUser, s.smtpPass, s.smtpSecure].join("|");
  if (cached?.key === key) return cached.t;
  const t = nodemailer.createTransport({
    host: s.smtpHost,
    port: parseInt(s.smtpPort, 10) || 587,
    secure: s.smtpSecure === "true",
    auth: s.smtpUser ? { user: s.smtpUser, pass: s.smtpPass } : undefined,
  });
  cached = { key, t };
  return t;
}

/** Sends through SMTP when configured; otherwise stores the message in the outbox so nothing is lost. */
export async function sendMail(m: Mail): Promise<"sent" | "outbox"> {
  const s = getSettings();
  if (!smtpReady(s)) {
    db().prepare("INSERT INTO outbox (to_email, subject, html, text, kind) VALUES (?, ?, ?, ?, ?)").run(m.to, m.subject, m.html, m.text, m.kind);
    return "outbox";
  }
  await transport(s).sendMail({
    from: s.fromName ? `"${s.fromName.replace(/"/g, "")}" <${s.fromEmail}>` : s.fromEmail,
    to: m.to,
    subject: m.subject,
    html: m.html,
    text: m.text,
    headers: m.headers,
  });
  return "sent";
}

// ---------- templates
const FONT = "font-family:Montserrat,-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;";

function shell(opts: { title: string; preheader: string; body: string; footer: string; base: string; handle: string }): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#000000;-webkit-font-smoothing:antialiased">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding-bottom:28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" style="width:40px;height:40px;border-radius:20px;background:#0071E3;background-image:radial-gradient(circle at 32% 28%,#7CC2FF 0%,#1A8CFF 36%,#0071E3 62%,#004BA8 100%);${FONT}color:#FFFFFF;font-size:14px;font-weight:700">MK</td>
<td style="padding-left:12px;${FONT}color:#FFFFFF;font-size:15px;font-weight:600"><a href="${opts.base}" style="color:#FFFFFF;text-decoration:none">${esc(opts.handle)}</a></td></tr></table></td></tr>
<tr><td>${opts.body}</td></tr>
<tr><td style="padding-top:28px;border-top:1px solid rgba(255,255,255,0.16);${FONT}color:rgba(255,255,255,0.56);font-size:13px;line-height:1.6">${opts.footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px"><tr><td style="border-radius:999px;background:#0071E3"><a href="${href}" style="display:inline-block;padding:16px 28px;${FONT}color:#FFFFFF;font-size:17px;font-weight:600;text-decoration:none;border-radius:999px">${esc(label)}</a></td></tr></table>`;
}

export function confirmEmail(token: string): Mail & { kind: string } {
  const s = getSettings();
  const base = baseUrl(s);
  const link = `${base}/subscribe/confirm?token=${encodeURIComponent(token)}`;
  const body = `<p style="${FONT}margin:0;color:#2997FF;font-size:15px;font-weight:600">One last step</p>
<h1 style="${FONT}margin:10px 0 0;color:#FFFFFF;font-size:36px;line-height:1.06;font-weight:700;letter-spacing:-0.04em">Confirm your email.<br><span style="color:#86868B">Then you’re in.</span></h1>
<p style="${FONT}margin:18px 0 0;color:rgba(255,255,255,0.72);font-size:17px;line-height:1.6">Tap the button to start getting AI news, tech, prompts and links to skills. One email a week.</p>
${button(link, "Confirm my email")}
<p style="${FONT}margin:28px 0 32px;color:rgba(255,255,255,0.56);font-size:14px;line-height:1.6">Didn’t ask for this? Ignore this email and you won’t hear from us.</p>`;
  return {
    to: "",
    subject: "Confirm your email",
    kind: "confirm",
    html: shell({ title: "Confirm your email", preheader: "One tap and you’re in.", body, footer: `Sent by ${esc(s.handle)}.`, base, handle: s.handle }),
    text: `Confirm your email. Then you’re in.\n\nOpen this link to start getting the newsletter:\n${link}\n\nDidn’t ask for this? Ignore this email.`,
  };
}

export function welcomeEmail(token: string): Mail {
  const s = getSettings();
  const base = baseUrl(s);
  const unsub = `${base}/unsubscribe?token=${encodeURIComponent(token)}`;
  const body = `<p style="${FONT}margin:0;color:#2997FF;font-size:15px;font-weight:600">You’re in</p>
<h1 style="${FONT}margin:10px 0 0;color:#FFFFFF;font-size:36px;line-height:1.06;font-weight:700;letter-spacing:-0.04em">Welcome aboard.<br><span style="color:#86868B">See you this week.</span></h1>
<p style="${FONT}margin:18px 0 0;color:rgba(255,255,255,0.72);font-size:17px;line-height:1.6">Each issue covers AI news, tech, prompts and links to skills, in plain words. While you wait, the archive has every past issue.</p>
${button(`${base}/issues`, "Read past issues")}<div style="height:32px"></div>`;
  return {
    to: "",
    subject: "Welcome aboard",
    kind: "welcome",
    html: shell({ title: "Welcome aboard", preheader: "Your first issue lands this week.", body, footer: `You can <a href="${unsub}" style="color:rgba(255,255,255,0.72)">unsubscribe</a> at any time.`, base, handle: s.handle }),
    text: `Welcome aboard. See you this week.\n\nPast issues: ${base}/issues\n\nUnsubscribe: ${unsub}`,
    headers: { "List-Unsubscribe": `<${unsub}>` },
  };
}

/** The issue as an email. Links are wrapped for click counts and an open pixel is added when a delivery id is given. */
export function issueEmail(post: Post, opts: { subject: string; preheader: string; token?: string; deliveryId?: string }): Mail {
  const s = getSettings();
  const base = baseUrl(s);
  const url = `${base}/issues/${post.slug}`;
  const unsub = opts.token ? `${base}/unsubscribe?token=${encodeURIComponent(opts.token)}` : `${base}/unsubscribe`;
  const oneClick = opts.token ? `${base}/api/unsubscribe?token=${encodeURIComponent(opts.token)}` : unsub;
  let content = `<p style="${FONT}margin:0;color:#2997FF;font-size:15px;font-weight:600">${esc(post.label)} · ${readMinutes(post)} min read</p>
<h1 style="${FONT}margin:10px 0 0;color:#FFFFFF;font-size:40px;line-height:1.04;font-weight:700;letter-spacing:-0.04em">${esc(post.title)}${post.title_sec ? `<br><span style="color:#86868B">${esc(post.title_sec)}</span>` : ""}</h1>
${post.excerpt ? `<p style="${FONT}margin:18px 0 32px;color:rgba(255,255,255,0.72);font-size:19px;line-height:1.5;font-weight:500">${esc(post.excerpt)}</p>` : `<div style="height:32px"></div>`}
${renderEmail(post.body, base, post.palette)}
<div style="padding:32px 0;border-top:1px solid rgba(255,255,255,0.16)">${button(url, "Read it on the web")}</div>`;
  if (opts.deliveryId) {
    const id = encodeURIComponent(opts.deliveryId);
    content = content.replace(/href="(https?:\/\/[^"]+)"/g, (m, href: string) => {
      if (href.includes("/unsubscribe")) return m;
      return `href="${base}/api/track/click?d=${id}&u=${encodeURIComponent(href.replace(/&amp;/g, "&"))}"`;
    });
    content += `<img src="${base}/api/track/open/${id}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">`;
  }
  const footer = `You get this because you joined the free newsletter at ${esc(base.replace(/^https?:\/\//, ""))}. <a href="${unsub}" style="color:rgba(255,255,255,0.72)">Unsubscribe</a> with one click.`;
  return {
    to: "",
    subject: opts.subject,
    kind: "issue",
    html: shell({ title: opts.subject, preheader: opts.preheader, body: content, footer, base, handle: s.handle }),
    text: `${post.title} ${post.title_sec}\n\n${post.excerpt}\n\n${renderText(post.body)}\n\nRead it on the web: ${url}\n\nUnsubscribe: ${unsub}`,
    headers: { "List-Unsubscribe": `<${oneClick}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}
