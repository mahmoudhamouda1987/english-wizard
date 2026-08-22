import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://englishwizard.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/auth`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/onboarding`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/diagnostic`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/offline`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ];
}
