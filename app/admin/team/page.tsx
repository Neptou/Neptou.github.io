"use client";

import { useEffect, useState } from "react";
import { authFetch, AuthError, getMe, type Me } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import AdminsTable from "@/components/AdminsTable";
import type { Admin } from "@/components/AdminsTable";

export default function TeamPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meData = await getMe();
        if (cancelled) return;
        setMe(meData);
        if (meData.role !== "super_admin") {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        setAuthorized(true);
        const res = await authFetch("/admin/admins");
        if (!res.ok) throw new Error();
        if (!cancelled) setAdmins(await res.json());
      } catch (e) {
        if (e instanceof AuthError) return;
        if (!cancelled) setError("Failed to load admins.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage admin accounts, roles, and per-resource permissions
          </p>
        </div>

        {loading && <p className="text-gray-500 text-center py-16">Loading…</p>}

        {!loading && authorized === false && (
          <p className="text-gray-400 text-center py-16">
            You need Super Admin access to manage the team.
          </p>
        )}

        {!loading && authorized && (
          <>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <AdminsTable
              admins={admins}
              meId={me?.id ?? null}
              onAdminsChange={(updater) => setAdmins((prev) => updater(prev))}
            />
          </>
        )}
      </main>
    </div>
  );
}
