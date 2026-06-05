import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Neptou"
            width={36}
            height={36}
            className="rounded-xl shadow-lg"
          />
          <span className="font-semibold text-lg tracking-tight">Neptou</span>
        </a>
        <a
          href="mailto:kathayatsubodh@gmail.com"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Contact Support
        </a>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: June 6, 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p>
              Neptou (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a Nepal travel companion app. This Privacy
              Policy explains what information we collect when you use the Neptou iOS app, how we
              use it, and your rights regarding that information. We are committed to handling your
              data responsibly and transparently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>

            <h3 className="text-base font-semibold text-gray-200 mb-2 mt-4">Location Data</h3>
            <p>
              With your explicit permission, Neptou accesses your device&apos;s location while the app
              is in use. This is used solely to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Show places near your current position</li>
              <li>Sort search results by proximity</li>
              <li>Display your location on the in-app map</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">
              Your location is processed on-device and is never transmitted to our servers or stored
              persistently. You can revoke location permission at any time in iOS Settings.
            </p>

            <h3 className="text-base font-semibold text-gray-200 mb-2 mt-6">Profile & Preferences</h3>
            <p>
              If you create an account, we store your travel interests and preferences (e.g.,
              adventure, culture, food) to generate personalized place recommendations. This
              information is stored securely and used only within the app to improve your experience.
            </p>

            <h3 className="text-base font-semibold text-gray-200 mb-2 mt-6">Saved Places</h3>
            <p>
              Places you save or add to trips are stored locally on your device and, if you are
              signed in, synced to your account so they are available across reinstalls.
            </p>

            <h3 className="text-base font-semibold text-gray-200 mb-2 mt-6">Usage Data</h3>
            <p>
              We do not use third-party analytics SDKs. We do not collect crash logs, session
              recordings, or behavioral tracking data through third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
            <p>Information collected is used exclusively to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Provide core app features (nearby places, map, trip planner)</li>
              <li>Generate personalized recommendations based on your stated interests</li>
              <li>Sync your saved places and trips across devices</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white">not</strong> sell, rent, share, or trade your
              personal information with third parties for advertising or marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Storage & Security</h2>
            <p>
              App data is stored using industry-standard cloud infrastructure with encryption at rest
              and in transit. Account credentials are handled securely and passwords are never stored
              in plain text.
            </p>
            <p className="mt-3">
              Place data (descriptions, images, coordinates) is bundled directly in the app and does
              not require an internet connection to browse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Children&apos;s Privacy</h2>
            <p>
              Neptou is not directed at children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you believe a child has provided us
              with personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw location permission at any time via iOS Settings → Privacy → Location Services</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:kathayatsubodh@gmail.com"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                kathayatsubodh@gmail.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              &quot;Last updated&quot; date at the top of this page. Continued use of the app after changes
              are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or how your data is
              handled, please contact:
            </p>
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5 text-sm space-y-1">
              <p className="text-white font-medium">Subodh Kathayat</p>
              <p className="text-gray-400">Neptou — Nepal Travel Guide</p>
              <a
                href="mailto:kathayatsubodh@gmail.com"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                kathayatsubodh@gmail.com
              </a>
            </div>
          </section>

        </div>
      </main>

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
  );
}
