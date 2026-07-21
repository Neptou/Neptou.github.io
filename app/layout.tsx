import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackendPing from "@/components/BackendPing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://neptou.github.io";
const DESCRIPTION =
  "Neptou is your free iOS travel companion for Nepal — discover hundreds of curated destinations, explore an interactive map, plan trips, get AI travel help, and reach emergency services fast. Now on the App Store.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Neptou — Discover Nepal | Free iOS Travel Guide App",
    template: "%s | Neptou",
  },
  description: DESCRIPTION,
  applicationName: "Neptou",
  authors: [{ name: "Neptou" }],
  creator: "Neptou",
  publisher: "Neptou",
  category: "travel",
  keywords: [
    "Nepal travel app",
    "Nepal travel guide",
    "discover Nepal",
    "Kathmandu",
    "Pokhara",
    "Himalayas trekking",
    "Nepal tourism",
    "trip planner Nepal",
    "Nepal map app",
    "Nepal emergency numbers",
    "Neptou",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Neptou",
    title: "Neptou — Discover Nepal",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      { url: "/logo.png", width: 1024, height: 1024, alt: "Neptou — Discover Nepal" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neptou — Discover Nepal",
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: { capable: true, title: "Neptou", statusBarStyle: "black-translucent" },
  // Apple Smart App Banner — Next.js emits <meta name="apple-itunes-app"
  // content="app-id=6756244066">. This is the app's real App Store numeric id
  // (https://apps.apple.com/app/neptou/id6756244066). Smart Banner only; no
  // custom banner UI.
  itunes: { appId: "6756244066" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
          <BackendPing />
          {children}
        </body>
    </html>
  );
}
