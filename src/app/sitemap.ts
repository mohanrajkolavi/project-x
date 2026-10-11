import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { livePosts, topics } from "@/lib/posts";
import { baseUrl } from "@/lib/settings";
import { parseSql } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = baseUrl();
  const posts = livePosts();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/issues`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/topics`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...posts.map((p) => ({ url: `${base}/issues/${p.slug}`, lastModified: parseSql(p.updated_at) ?? undefined, priority: 0.7 })),
    ...topics().map((t) => ({ url: `${base}/topics/${t.slug}`, priority: 0.4 })),
  ];
}
