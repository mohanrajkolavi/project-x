import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { baseUrl } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }], sitemap: `${baseUrl()}/sitemap.xml` };
}
