import { livePosts } from "@/lib/posts";
import { getSettings, baseUrl } from "@/lib/settings";
import { renderWeb, esc } from "@/lib/markdown";
import { parseSql } from "@/lib/format";

export async function GET() {
  const s = getSettings();
  const base = baseUrl(s);
  const items = livePosts({ limit: 30 })
    .map((p) => {
      const url = `${base}/issues/${p.slug}`;
      const html = renderWeb(p.body, p.palette).replace(/(src|href)="\//g, `$1="${base}/`);
      return `<item><title>${esc(`${p.title}${p.title_sec ? ` ${p.title_sec}` : ""}`)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${parseSql(p.published_at)!.toUTCString()}</pubDate><description>${esc(p.excerpt)}</description><content:encoded><![CDATA[${html.replace(/]]>/g, "]]&gt;")}]]></content:encoded></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(s.siteName)}</title><link>${base}</link><description>${esc(s.siteDescription)}</description><language>en-us</language><atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=600" } });
}
