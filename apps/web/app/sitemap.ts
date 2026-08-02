import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const [{ data: categories }, { data: listings }, { data: businessCategories }, { data: businesses }] =
    await Promise.all([
      supabase.from("categories").select("slug").eq("is_active", true),
      supabase
        .from("listings")
        .select("slug, updated_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(5000),
      supabase.from("business_categories").select("slug"),
      supabase
        .from("businesses")
        .select("slug, updated_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(5000),
    ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/business`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/rules`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${siteUrl}/category/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const listingPages: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `${siteUrl}/listings/${l.slug}`,
    lastModified: l.updated_at,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const businessCategoryPages: MetadataRoute.Sitemap = (businessCategories ?? []).map((c) => ({
    url: `${siteUrl}/business/category/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const businessPages: MetadataRoute.Sitemap = (businesses ?? []).map((b) => ({
    url: `${siteUrl}/business/${b.slug}`,
    lastModified: b.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...listingPages, ...businessCategoryPages, ...businessPages];
}
