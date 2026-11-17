import Image from "next/image";
import Link from "next/link";

export type PrivacyPlatform = "all" | "ios" | "android";

const LINK = "text-red-400 hover:text-red-300 transition-colors";

/**
 * The privacy policy. `/privacy/` shows every platform; `/privacy/ios/` and `/privacy/android/`
 * (linked from App Store Connect and Play Console) show one. Shared text lives here only.
 */
export default function PrivacyPolicy({ platform }: { platform: PrivacyPlatform }) {
  const ios = platform !== "android";
  const android = platform !== "ios";
  const appName = { all: "app for iOS and Android", ios: "app for iOS", android: "app for Android" }[platform];
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Neptou"
            width={36}
            height={36}
            className="rounded-xl shadow-lg"
          />
          <span className="font-semibold text-lg tracking-tight">Neptou</span>
        </Link>
        <a
          href="mailto:hello@neptou.com"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Contact Support
        </a>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">
          Privacy Policy{platform === "ios" && " — iOS"}{platform === "android" && " — Android"}
        </h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: November 17, 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p>
              Neptou (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a Nepal travel companion {appName}. This Privacy Policy explains what information the app uses, where it is kept,
              and your choices. In short: Neptou has no accounts, no ads and no analytics, and your
              personal information stays on your device.
            </p>
            <p className="mt-3 text-sm text-gray-400">
              {platform === "all" ? (
                <>
                  Platform versions: <Link href="/privacy/ios/" className={LINK}>iOS</Link> ·{" "}
                  <Link href="/privacy/android/" className={LINK}>Android</Link>
                </>
              ) : (
                <>
                  This page covers the {appName} only. See the{" "}
                  <Link href="/privacy/" className={LINK}>full policy</Link> for all platforms.
                </>
              )}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Information on Your Device</h2>

            <h3 className="text-base font-semibold text-gray-200 mb-2 mt-4">Location</h3>
            <p>
              With your permission, Neptou uses your device&apos;s location while the app is open to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Show your position on the in-app map</li>
              <li>Show places near you and sort results by distance</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">
              Your location is used only on your device. It is never sent to our servers or anyone
              else, and it is not stored. Neptou never uses your location in the background.
            </p>

            <h3 className="text-base font-semibold text-gray-200 mb-2 mt-6">Profile, Saved Places and Trips</h3>
            <p>
              Your travel style, interests, saved and liked places, and trips are stored only on your
              device. Neptou has no accounts, and this information is never uploaded. Deleting the app
              deletes it.
            </p>
            <p className="mt-3">
              If you choose to add a trip to your calendar or open a place in a maps app, Neptou hands
              that item to the app you pick; what happens next is covered by that app&apos;s own policy.
            </p>

            <h3 className="text-base font-semibold text-gray-200 mb-2 mt-6">Usage Data</h3>
            <p>
              We do not use analytics, advertising or crash-reporting services, and we do not track
              you across apps or websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What the App Downloads</h2>
            <p>
              To show up-to-date content, the app downloads information from these services. It does
              not send them your name, location, profile or any identifier, but like any website they
              receive your device&apos;s IP address and the request itself (for example, which map
              area to draw):
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Our server (places, foods, travel routes and emergency contacts)</li>
              {android && <li>OpenFreeMap, for map tiles built from OpenStreetMap data{ios && " (Android)"}</li>}
              {ios && <li>Apple Maps, for maps{android && " on iOS"}</li>}
              <li>Wikimedia Commons and other image hosts, for place photos</li>
            </ul>
            <p className="mt-3">
              Downloaded places, map areas you have viewed and photos are kept on your device so the
              app works with a weak or no connection.
              {android && <> You can clear saved maps and photos at any time in Profile → Storage{ios && " (Android)"}.</>}
              {" "}All connections use HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Sharing</h2>
            <p>
              We do <strong className="text-white">not</strong> sell, rent, share or trade personal
              information. We don&apos;t hold any personal information to share.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Children&apos;s Privacy</h2>
            <p>
              Neptou is not directed at children under the age of 13 and does not knowingly collect
              personal information from anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Choices</h2>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              {ios && (
                <li>
                  Turn location access off at any time{android && " on iPhone"}: Settings → Privacy &amp;
                  Security → Location Services → Neptou
                </li>
              )}
              {android && (
                <li>
                  Turn location access off at any time{ios && " on Android"}: Settings → Apps → Neptou →
                  Permissions → Location
                </li>
              )}
              {android && <li>Clear saved maps and photos in the app under Profile → Storage</li>}
              <li>Delete the app to remove everything Neptou has stored on your device</li>
            </ul>
            <p className="mt-3">
              Questions? Contact us at{" "}
              <a
                href="mailto:hello@neptou.com"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                hello@neptou.com
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
                href="mailto:hello@neptou.com"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                hello@neptou.com
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
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <a href="mailto:hello@neptou.com" className="hover:text-gray-300 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
