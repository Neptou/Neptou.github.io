import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { ContactCard, LEGAL_LINK, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms/" },
};

/** Terms for the Neptou apps (iOS and Android). Linked from Play Console's trader/ToS page. */
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="November 18, 2026">
      <LegalSection title="About These Terms">
        <p>
          These terms apply to the Neptou app for iOS and Android (&quot;Neptou&quot;, &quot;the
          app&quot;), a free Nepal travel guide. By downloading or using the app you agree to them.
          If you don&apos;t agree, please don&apos;t use the app. Nothing in these terms limits any
          rights you have under the consumer protection laws of your country.
        </p>
      </LegalSection>

      <LegalSection title="The App">
        <p>
          Neptou is free to download and use. It has no accounts, purchases or ads. The app helps
          you discover places and food in Nepal, view them on a map and plan trips. Your profile,
          saved places and trips are stored on your device; see the{" "}
          <Link href="/privacy/" className={LEGAL_LINK}>Privacy Policy</Link> for details.
        </p>
      </LegalSection>

      <LegalSection title="Travel Information">
        <p>
          We work to keep the information in Neptou accurate, but places, opening times, prices,
          routes, travel times, permits and emergency numbers change, and some details may be out of
          date or wrong. Treat the app as a guide, not a guarantee:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
          <li>Check important details, such as permits, road conditions and weather, with official or local sources before you travel</li>
          <li>Trekking, mountain and outdoor activities carry real risks; follow local rules and use licensed guides where required</li>
          <li>In an emergency, contact local emergency services directly; don&apos;t rely on the app alone</li>
        </ul>
        <p className="mt-3">
          Maps are for travel guidance only. They are not suitable for precise navigation and are not
          an authoritative source for borders.
        </p>
      </LegalSection>

      <LegalSection title="Third-Party Content and Services">
        <p>
          Some content comes from others under their own licences: map data from OpenStreetMap
          contributors, and place photos from Wikimedia Commons and other sources, credited in the
          app. When you choose to open a place in another app, such as a maps or calendar app, that
          app&apos;s own terms apply.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable Use">
        <p>Please use Neptou for your own travel planning. Don&apos;t:</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
          <li>Copy, scrape or resell the app&apos;s content or data in bulk</li>
          <li>Interfere with or overload the app or the servers it uses</li>
          <li>Use the app in a way that breaks the law</li>
        </ul>
      </LegalSection>

      <LegalSection title="Ownership">
        <p>
          The Neptou name, logo, app and our own written content belong to Neptou. Third-party
          content remains the property of its owners and is used under its licence.
        </p>
      </LegalSection>

      <LegalSection title="Availability and Changes">
        <p>
          We may update, change or stop parts of the app at any time, and some features need an
          internet connection. We may also update these terms; the &quot;Last updated&quot; date shows
          the latest version, and continuing to use the app after a change means you accept it.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer and Liability">
        <p>
          Neptou is provided free of charge and &quot;as is&quot;. To the extent permitted by law, we
          make no promises that the app or its information will always be available, complete or
          accurate, and we are not liable for loss or damage arising from your use of it or reliance
          on its information. This does not exclude liability that cannot be excluded by law.
        </p>
      </LegalSection>

      <LegalSection title="Contact Us">
        <p>Questions about these terms? Contact:</p>
        <ContactCard />
      </LegalSection>
    </LegalPage>
  );
}
