"use client";

import { useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";

export default function AdminHeader() {
  const router = useRouter();

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
    <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
          <span className="text-sm font-bold text-white">N</span>
        </div>
        <span className="font-semibold text-lg">Neptou Admin</span>
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
