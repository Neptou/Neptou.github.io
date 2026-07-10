import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    <div className="flex flex-col min-h-screen bg-gray-950 text-white font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Neptou"
            width={36}
            height={36}
            className="rounded-xl shadow-lg"
          />
          <span className="font-semibold text-lg tracking-tight">Neptou</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Download on iOS →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto w-full">
        {/* Badge */}
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 rounded-full px-4 py-1.5 text-sm text-emerald-300 mb-8 hover:border-emerald-600 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now available on the App Store
        </a>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
          Discover{" "}
          <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Nepal
          </span>
          ,<br />
          effortlessly.
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">
          Neptou guides you through Nepal&apos;s most stunning destinations — from ancient temples in
          Kathmandu to hidden valleys in the Himalayas. Handpicked places, all in your pocket.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center gap-3 bg-white text-gray-950 font-semibold px-7 py-3.5 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <AppleIcon />
            Download on the App Store
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-300 px-7 py-3.5 rounded-2xl hover:border-gray-500 hover:text-white transition-colors"
          >
            Learn more ↓
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to explore Nepal
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Built for travelers, adventurers, and curious minds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-20 border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24 bg-gray-900/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you might want to know about Neptou.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group bg-gray-900 border border-gray-800 rounded-2xl px-6 py-5 open:border-gray-700"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-white">
                  {f.q}
                  <span className="ml-4 text-gray-500 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-gray-400 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to explore Nepal?
          </h2>
          <p className="text-gray-400 mb-8">
            Neptou is available on the App Store — free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-red-900/30"
            >
              <AppleIcon />
              Get it on iOS — Free
            </a>
            <a
              href="mailto:kathayatsubodh@gmail.com"
              className="inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-300 px-7 py-3.5 rounded-2xl hover:border-gray-500 hover:text-white transition-colors"
            >
              Contact support →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Neptou"
              width={20}
              height={20}
              className="rounded"
            />
            <span>© {new Date().getFullYear()} Neptou. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="mailto:kathayatsubodh@gmail.com" className="hover:text-gray-300 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

const APP_STORE_URL = "https://apps.apple.com/app/neptou/id6756244066";
const SITE_URL = "https://neptou.github.io";

// Natural-language Q&A — rendered on the page AND emitted as FAQPage JSON-LD.
// Phrased to match how people ask AI assistants ("free travel app for Nepal?").
// Keep the visible text and the structured data identical (a Google requirement).
const faqs = [
  {
    q: "What is Neptou?",
    a: "Neptou is a free iOS travel companion app for Nepal. It helps you discover curated destinations, explore an interactive map, plan multi-day trips, get AI travel help, and reach Nepal's emergency services quickly.",
  },
  {
    q: "Is Neptou free?",
    a: "Yes. Neptou is free to download and use on the Apple App Store.",
  },
  {
    q: "What platforms is Neptou available on?",
    a: "Neptou is available on iOS for iPhone and iPad through the Apple App Store.",
  },
  {
    q: "Does Neptou work offline?",
    a: "Yes. Core places and maps are available on-device, so you can explore Nepal without an internet connection.",
  },
  {
    q: "What language is Neptou in?",
    a: "Neptou's interface is in English. Place names include their local Nepali forms, and the in-app AI assistant can understand and answer questions in many languages.",
  },
  {
    q: "Does Neptou include Nepal emergency numbers?",
    a: "Yes. Neptou offers one-tap dialing for Police (100), Fire Brigade (101), and Ambulance (102), plus a searchable emergency-contacts directory that sorts nearby help first.",
  },
  {
    q: "Where can I download Neptou?",
    a: "Neptou is on the Apple App Store at https://apps.apple.com/app/neptou/id6756244066.",
  },
];

// JSON-LD structured data for rich results and AI answer engines
// (app listing + site + organization + FAQ).
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MobileApplication",
      name: "Neptou",
      operatingSystem: "iOS",
      applicationCategory: "TravelApplication",
      url: SITE_URL,
      downloadUrl: APP_STORE_URL,
      installUrl: APP_STORE_URL,
      sameAs: [APP_STORE_URL],
      description:
        "Neptou is a free iOS travel companion for Nepal — discover curated destinations, explore an interactive map, plan trips, get AI travel help, and reach emergency services fast.",
      featureList: [
        "Curated Nepal destinations",
        "Interactive map",
        "Multi-day trip planner",
        "AI travel assistant",
        "Nepal emergency contacts (Police, Fire, Ambulance)",
        "Offline access",
      ],
      inLanguage: "en",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "Neptou" },
    },
    {
      "@type": "WebSite",
      name: "Neptou",
      url: SITE_URL,
    },
    {
      "@type": "Organization",
      name: "Neptou",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      email: "kathayatsubodh@gmail.com",
      sameAs: [APP_STORE_URL],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const features = [
  {
    icon: "🗺️",
    title: "Curated Places",
    description:
      "Temples, trekking routes, viewpoints, local restaurants, and hidden gems handpicked from across Nepal.",
  },
  {
    icon: "🧭",
    title: "Interactive Map",
    description:
      "Explore Nepal visually with a beautiful map. Filter by category and discover places near you.",
  },
  {
    icon: "✈️",
    title: "Trip Planner",
    description:
      "Build your perfect itinerary day by day. Add activities, set times, and keep everything organized.",
  },
  {
    icon: "🤖",
    title: "AI Recommendations",
    description:
      "Get personalized place suggestions tailored to your travel style, interests, and past favorites.",
  },
  {
    icon: "🆘",
    title: "Emergency Contacts",
    description:
      "One-tap dialing for Police, Fire Brigade, and Ambulance, plus a searchable directory that puts nearby help first.",
  },
  {
    icon: "📱",
    title: "Works Offline",
    description:
      "All places and maps are bundled on-device. No signal? No problem — explore without internet.",
  },
];

const stats = [
  { value: "20+", label: "Places" },
  { value: "77", label: "Districts" },
  { value: "iOS", label: "iPhone & iPad" },
  { value: "Free", label: "Always" },
];

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
