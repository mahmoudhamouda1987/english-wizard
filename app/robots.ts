import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://englishwizard.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/auth", "/onboarding"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/learn/", "/settings/", "/review/", "/teacher-help/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
