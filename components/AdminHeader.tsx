"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getToken,
  clearToken,
  getMe,
  canAccess,
  isSuperAdmin,
  type Me,
} from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";
import ChangePasswordModal from "@/components/ChangePasswordModal";

const NAV_TABS = [
  { href: "/admin/dashboard", label: "Places", resource: "places" },
  { href: "/admin/maps", label: "Maps", resource: "places" },
  { href: "/admin/foods", label: "Foods", resource: "foods" },
  { href: "/admin/festivals", label: "Festivals", resource: "festivals" },
  {
    href: "/admin/emergency-contacts",
    label: "Emergency Contacts",
    resource: "emergency_contacts",
  },
] as const;

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch(() => {});
  }, []);

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

  const visibleTabs = NAV_TABS.filter((tab) => canAccess(me, tab.resource));

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
          {visibleTabs.map((tab) => {
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
          {isSuperAdmin(me) && (
            <Link
              href="/admin/team"
              className={
                "px-3 py-1.5 rounded-lg text-sm transition-colors " +
                (pathname?.startsWith("/admin/team")
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-900")
              }
            >
              Team
            </Link>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {me && (
          <div className="text-right leading-tight hidden sm:block">
            <span className="text-sm text-white">{me.username}</span>
            <span className="block text-xs text-gray-500">
              {me.role === "super_admin" ? "Super Admin" : "Admin"}
            </span>
          </div>
        )}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Change password
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </header>
  );
}
