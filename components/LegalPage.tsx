import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_LINK = "text-red-400 hover:text-red-300 transition-colors";

/** Nav, title, footer and section styles shared by the privacy policy and terms pages. */
export default function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
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
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">{children}</div>
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
            <Link href="/privacy/" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms/" className="hover:text-gray-300 transition-colors">
              Terms of Service
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

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function ContactCard() {
  return (
    <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5 text-sm space-y-1">
      <p className="text-white font-medium">Neptou Team</p>
      <p className="text-gray-400">Neptou — Nepal Travel Guide</p>
      <a href="mailto:hello@neptou.com" className={LEGAL_LINK}>
        hello@neptou.com
      </a>
    </div>
  );
}
