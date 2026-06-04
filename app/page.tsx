export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Neptou</span>
        </div>
        <a
          href="https://apps.apple.com"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Download on iOS →
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 rounded-full px-4 py-1.5 text-sm text-red-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Now available on the App Store
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
          Discover{" "}
          <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Nepal
          </span>
          ,<br />
          effortlessly.
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">
          Neptou guides you through Nepal's most stunning destinations — from ancient temples in
          Kathmandu to hidden valleys in the Himalayas. 400+ curated places, all in your pocket.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://apps.apple.com"
            className="inline-flex items-center gap-3 bg-white text-gray-950 font-semibold px-7 py-3.5 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            <AppleIcon />
            Download on the App Store
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 px-7 py-3.5 rounded-2xl hover:border-gray-500 hover:text-white transition-colors"
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

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to explore Nepal?
          </h2>
          <p className="text-gray-400 mb-8">
            Download Neptou for free and start discovering.
          </p>
          <a
            href="https://apps.apple.com"
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-red-900/30"
          >
            <AppleIcon />
            Get it on iOS — Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <span className="text-xs font-bold text-white">N</span>
            </div>
            <span>© {new Date().getFullYear()} Neptou. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="mailto:support@neptou.app" className="hover:text-gray-300 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🗺️",
    title: "400+ Curated Places",
    description:
      "Temples, trekking routes, viewpoints, local restaurants, and hidden gems across every district of Nepal.",
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
    icon: "🌐",
    title: "8 Languages",
    description:
      "Available in English, Nepali, German, Chinese, Japanese, French, Spanish, and Hindi.",
  },
  {
    icon: "📱",
    title: "Works Offline",
    description:
      "All places and maps are bundled on-device. No signal? No problem — explore without internet.",
  },
];

const stats = [
  { value: "400+", label: "Places" },
  { value: "77", label: "Districts" },
  { value: "8", label: "Languages" },
  { value: "Free", label: "Always" },
];

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
