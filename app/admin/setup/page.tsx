"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";
import SetupForm from "@/components/SetupForm";

export default function SetupPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BACKEND_URL}/admin/status`)
      .then((res) => res.json())
      .catch(() => ({ has_admins: false }))
      .then((data) => {
        if (cancelled) return;
        if (data.has_admins) {
          router.replace("/admin/login");
        } else {
          setReady(true);
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Admin Account</h1>
          <p className="text-gray-400 text-sm mt-1">First-time setup — no accounts exist yet</p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}
