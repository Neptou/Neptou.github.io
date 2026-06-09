"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";

const NAV_TABS = [
  { href: "/admin/dashboard", label: "Places" },
  { href: "/admin/foods", label: "Foods" },
  { href: "/admin/emergency-contacts", label: "Emergency Contacts" },
] as const;

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const token = getToken();
    if (token) {
      await fetch(`${BACKEND_URL}/admin/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearToken();
    router.push("/admin/login");
  }

  return (
    <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="font-semibold text-lg">Neptou Admin</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  "px-3 py-1.5 rounded-lg text-sm transition-colors " +
                  (active
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900")
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </header>
  );
}
