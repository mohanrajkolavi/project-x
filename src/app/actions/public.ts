"use server";

import { headers } from "next/headers";
import { rateLimited } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { upsertSubscriber, validEmail, normalEmail } from "@/lib/subscribers";
import { confirmEmail, sendMail, welcomeEmail } from "@/lib/email";

export type SubscribeState = { ok: boolean; message: string; email?: string } | null;

export async function subscribe(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  // Bots fill every field; people never see this one.
  if (String(form.get("website") || "")) return { ok: true, message: "Check your inbox to confirm." };
  const email = normalEmail(String(form.get("email") || ""));
  if (!validEmail(email)) return { ok: false, message: "That email doesn’t look right. Try again?", email };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  if (rateLimited(`sub:${ip}`, 8, 10 * 60_000)) return { ok: false, message: "Too many tries. Wait a few minutes, then try again.", email };

  const source = String(form.get("source") || "").slice(0, 120);
  const s = getSettings();
  const doubleOptIn = s.doubleOptIn !== "false";
  const { sub, needsConfirm } = upsertSubscriber(email, source, doubleOptIn);
  try {
    if (needsConfirm) await sendMail({ ...confirmEmail(sub.token), to: sub.email });
    else if (sub.status === "active" && sub.confirmed_at && !doubleOptIn) await sendMail({ ...welcomeEmail(sub.token), to: sub.email });
  } catch (e) {
    console.error("subscribe mail failed", e);
    return { ok: false, message: "We couldn’t send the email just now. Try again soon.", email };
  }
  return needsConfirm
    ? { ok: true, message: "Check your inbox. Tap the link to confirm." }
    : { ok: true, message: "You’re in. See you this week." };
}
