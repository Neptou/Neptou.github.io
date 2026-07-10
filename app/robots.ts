import type { MetadataRoute } from "next";

// Required for `output: "export"` — emit a static robots.txt at build time.
export const dynamic = "force-static";

const SITE_URL = "https://neptou.github.io";

// AI answer-engine / LLM crawlers we explicitly welcome so assistants can index
// and recommend Neptou. (Default is allow-all anyway; listing them makes the
// intent explicit and survives a future tightening of the `*` rule.)
const AI_CRAWLERS = [
  "GPTBot", // OpenAI training
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // ChatGPT on-demand browsing
  "ClaudeBot", // Anthropic
  "anthropic-ai",
  "Claude-Web",
  "Claude-User",
  "PerplexityBot", // Perplexity index
  "Perplexity-User",
  "Google-Extended", // Gemini / Vertex grounding
  "Applebot-Extended", // Apple Intelligence
  "Amazonbot",
  "meta-externalagent", // Meta AI
  "cohere-ai",
  "CCBot", // Common Crawl (feeds many models)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin panel is not useful content for search / AI engines.
        disallow: "/admin/",
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: "/admin/",
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
