import crypto from "node:crypto";
import { db, sqlDate } from "./db";
import { insertPost, uniqueSlug, type PostInput } from "./posts";

const daysAgo = (n: number, h = 9) => {
  const d = new Date(Date.now() - n * 864e5);
  d.setUTCHours(h, 0, 0, 0);
  return sqlDate(d);
};

const SAMPLES: Omit<PostInput, "slug" | "status" | "published_at">[] = [
  {
    title: "What a token is.",
    title_sec: "And why it sets the price.",
    label: "Explained",
    numeral: "",
    excerpt: "Every AI chat runs on tokens (chunks of text). Here’s what they are, how they’re counted and why they matter for cost and limits.",
    tags: "Basics, Pricing",
    art: "bulb",
    palette: "lagoon",
    hero: "sky",
    body: `#### What it is
## A token is a chunk of text. / Not quite a word.

AI models don’t read letters or words. They read tokens. A token can be a whole short word, part of a long word or a bit of punctuation.

In English, one token is about 4 characters on average. So 100 words is roughly 130 tokens.

---

#### Why it matters
## Tokens set the bill. / And the limits.

\`\`\`rows
Price | Per 1M tokens
Context window | Max tokens it can see | yes
Reply length | Max tokens out
Speed | Tokens per second
\`\`\`

Paid plans and APIs (how apps talk to the model) count tokens in and tokens out. Output tokens usually cost more than input tokens.

---

#### How it works
## Text in, tokens out. / Then text again.

\`\`\`steps
Your text is split into tokens
Each token becomes a number
The model predicts the next token
Tokens turn back into text
\`\`\`

---

@center
#### Try it
## See your own tokens. / In one prompt.

\`\`\`prompt
Split this sentence into tokens and number each one: [paste a sentence].
You get · a numbered list of tokens
\`\`\`

---

#### The catch
## Other languages cost more. / Same idea, more tokens.

Many languages need more tokens for the same meaning. Code and long numbers can too. If a bill looks high, check how many tokens your text really uses.
`,
  },
  {
    title: "5 prompts for a cleaner inbox.",
    title_sec: "Copy, fill, send.",
    label: "Prompt pack",
    numeral: "5",
    excerpt: "Five ready-to-copy prompts that turn a messy inbox into short replies, clear summaries and fewer follow-ups.",
    tags: "Prompts, Email",
    art: "bubbles",
    palette: "orchid",
    hero: "orchid",
    body: `#### How to use these
## Copy the prompt. / Fill the blanks.

Paste each one into any AI chat. Swap the blue [fill-ins] for your own details, then check the result before you send it.

---

#### Prompt 1 · Reply
## Answer a long email. / In three lines.

\`\`\`prompt
Write a friendly reply to this email in 3 short lines. Say yes to [the main ask] and ask about [one open question]. Email: [paste it].
You get · a ready-to-send reply
\`\`\`

---

#### Prompt 2 · Summary
## Catch up on a thread. / Without reading it all.

\`\`\`prompt
Summarise this email thread in [3] bullets for [my manager]. End with who owes what by when. Thread: [paste it].
You get · a short, sendable summary
\`\`\`

---

#### Prompt 3 · Decline
## Say no. / Kindly and fast.

\`\`\`prompt
Write a polite reply that declines [the request]. Keep the door open for [a later date]. Under 60 words.
You get · a warm no that keeps the relationship
\`\`\`

---

#### Prompt 4 · Follow-up
## Nudge without nagging. / One short note.

\`\`\`prompt
Write a short follow-up to [name] about [topic]. It’s been [5 days]. Sound helpful, not pushy.
You get · a gentle nudge you can send now
\`\`\`

---

#### Prompt 5 · Triage
## Sort the pile. / Before you start.

\`\`\`prompt
Sort these email subjects into Reply today, This week and Archive. Explain each pick in 5 words: [paste subjects].
You get · a to-do list for your inbox
\`\`\`

---

#### Cheat sheet
## Five jobs. / Five prompts.

\`\`\`rows
Reply | 3 lines | yes
Summary | 3 bullets | yes
Decline | Under 60 words | yes
Follow-up | One nudge | yes
Triage | 3 piles | yes
\`\`\`
`,
  },
  {
    title: "Chat or API?",
    title_sec: "Pick by the job.",
    label: "Compared",
    numeral: "",
    excerpt: "The chat app and the API (how apps talk to the model) run the same models. Here’s when each one fits.",
    tags: "Basics, Tools",
    art: "versus",
    palette: "electric",
    hero: "titanium",
    body: `#### Two doors
## Same models. / Different doors.

The chat app is where you type and read. The API lets your own code send text and get answers back. Both reach the same family of models.

---

#### Side by side
## Pick by the job. / Not by the hype.

\`\`\`versus
Chat app | API
Setup | Sign in and type | Get a key, write code | a
Best for | Your own work | Apps and automation | b
Pricing | Monthly plan | Pay per token | none
Control | Settings menu | Every option | b
Verdict: Chat for daily work. API for building things.
\`\`\`

---

#### A common myth
## Check before you choose. / One myth to drop.

\`\`\`flip
Kicker: Myth 1
Myth: The API is only for big companies.
Fact: Anyone with a key can use it.
Proof: You pay only for the tokens you use.
\`\`\`

---

#### Next step
## Start with chat. / Move when it repeats.

\`\`\`steps
[x] Do the task by hand in chat
[x] Save the prompt that works
Run it often? Try the API
Keep a human check on results
\`\`\`
`,
  },
];

export function seedSamples(authorId: number) {
  SAMPLES.forEach((s, i) => {
    insertPost({ ...s, slug: uniqueSlug(s.title), status: "published", published_at: daysAgo(i * 7 + 1) }, authorId);
  });
}

/** Demo audience, traffic and one finished send, so the dashboard has something to show. */
export function seedDemo() {
  const d = db();
  const rnd = (() => {
    let s = 42;
    return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  })();
  const posts = d.prepare("SELECT id, slug FROM posts WHERE status = 'published'").all() as { id: number; slug: string }[];
  d.transaction(() => {
    const insSub = d.prepare(
      "INSERT OR IGNORE INTO subscribers (email, status, token, source, created_at, confirmed_at, unsubscribed_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    const sources = ["/", "/", "/", "/issues", "/about", ...posts.map((p) => `/issues/${p.slug}`)];
    let n = 0;
    for (let day = 89; day >= 0; day--) {
      const joins = Math.floor(rnd() * (2 + (90 - day) / 18));
      for (let j = 0; j < joins; j++) {
        n++;
        const at = daysAgo(day, 6 + Math.floor(rnd() * 14));
        const r = rnd();
        const status = r < 0.06 ? "unsubscribed" : r < 0.1 ? "pending" : "active";
        insSub.run(
          `reader${n}@example.com`,
          status,
          crypto.randomBytes(18).toString("base64url"),
          sources[Math.floor(rnd() * sources.length)],
          at,
          status === "pending" ? null : at,
          status === "unsubscribed" ? daysAgo(Math.max(0, day - 3)) : null,
        );
      }
    }
    const insView = d.prepare("INSERT INTO page_views (path, post_id, referrer, visitor, day, created_at) VALUES (?, ?, ?, ?, ?, ?)");
    const refs = ["", "", "", "google.com", "instagram.com", "linkedin.com", "x.com", "news.ycombinator.com"];
    for (let day = 29; day >= 0; day--) {
      const date = daysAgo(day).slice(0, 10);
      const weekly = day % 7 === 1 ? 2.2 : 1;
      const count = Math.floor((30 + (30 - day) * 2 + rnd() * 25) * weekly);
      for (let v = 0; v < count; v++) {
        const onPost = rnd() < 0.55 && posts.length;
        const p = onPost ? posts[Math.floor(rnd() * posts.length)] : null;
        const path = p ? `/issues/${p.slug}` : ["/", "/", "/issues", "/topics", "/about"][Math.floor(rnd() * 5)];
        insView.run(path, p?.id ?? null, refs[Math.floor(rnd() * refs.length)], `demo${day}-${Math.floor(rnd() * count * 0.7)}`, date, `${date} 12:00:00`);
      }
    }
    if (posts[0]) {
      const camp = d
        .prepare("INSERT INTO campaigns (post_id, subject, preheader, status, recipients, created_at, sent_at) VALUES (?, ?, ?, 'sent', 0, ?, ?)")
        .run(posts[0].id, "What a token is (and why it sets the price)", "Plain words on the unit every AI bill is counted in.", daysAgo(1, 8), daysAgo(1, 9));
      const cid = Number(camp.lastInsertRowid);
      const subs = d.prepare("SELECT id, email FROM subscribers WHERE status = 'active' AND confirmed_at <= ?").all(daysAgo(1, 9)) as { id: number; email: string }[];
      const insDel = d.prepare("INSERT INTO deliveries (id, campaign_id, subscriber_id, email, status, sent_at, opened_at, clicked_at) VALUES (?, ?, ?, ?, 'sent', ?, ?, ?)");
      const insClick = d.prepare("INSERT INTO clicks (delivery_id, url, created_at) VALUES (?, ?, ?)");
      for (const s of subs) {
        const id = crypto.randomBytes(12).toString("base64url");
        const opened = rnd() < 0.52;
        const clicked = opened && rnd() < 0.22;
        insDel.run(id, cid, s.id, s.email, daysAgo(1, 9), opened ? daysAgo(1, 10) : null, clicked ? daysAgo(1, 11) : null);
        if (clicked) insClick.run(id, `/issues/${posts[0].slug}`, daysAgo(1, 11));
      }
      d.prepare("UPDATE campaigns SET recipients = ? WHERE id = ?").run(subs.length, cid);
    }
  })();
}
