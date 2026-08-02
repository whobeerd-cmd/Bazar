import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("title, slug, description, price, price_type, cover_image_url, published_at, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (listings ?? [])
    .map((listing) => {
      const link = `${siteUrl}/listings/${listing.slug}`;
      const pubDate = new Date(listing.published_at ?? listing.created_at).toUTCString();
      const description = `${formatPrice(listing.price_type, listing.price)} — ${listing.description.slice(0, 300)}`;
      return `  <item>
    <title>${escapeXml(listing.title)}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(description)}</description>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Bazar — новые объявления</title>
  <link>${siteUrl}</link>
  <description>Свежие объявления на Bazar — площадке объявлений Республики Ингушетия</description>
  <language>ru</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
