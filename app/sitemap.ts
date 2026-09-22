import type { MetadataRoute } from "next";
import products from "@/lib/json/product.json";
import { getAllBlogPosts } from "@/lib/sanityQueries";

const BASE_URL = "https://www.modelteknoloji.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,         changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/blogs`,    changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/about`,    changeFrequency: "yearly",  priority: 0.7 },
    { url: `${BASE_URL}/contact`,  changeFrequency: "yearly",  priority: 0.7 },
    { url: `${BASE_URL}/baslangic`, changeFrequency: "yearly", priority: 0.9 },
    { url: `${BASE_URL}/privacy`,  changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/terms`,    changeFrequency: "yearly",  priority: 0.2 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products as { id: string }[]).map((p) => ({
    url: `${BASE_URL}/products/${p.id}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const posts = await getAllBlogPosts().catch(() => []);
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const slug = typeof post.slug === "string" ? post.slug : post.slug?.current ?? post._id;
    return {
      url: `${BASE_URL}/blogs/${slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
