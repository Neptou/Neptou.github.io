import type { MetadataRoute } from "next";

// Required for `output: "export"` — emit a static sitemap.xml at build time.
export const dynamic = "force-static";

const SITE_URL = "https://neptou.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy/ios/`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy/android/`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms/`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
