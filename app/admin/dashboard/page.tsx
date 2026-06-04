"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";
import PlacesTable from "@/components/PlacesTable";
import AdminHeader from "@/components/AdminHeader";
import type { Place } from "@/components/PlacesTable";

export default function DashboardPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    fetch(`${BACKEND_URL}/admin/places`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setPlaces(data);
      })
      .catch(() => setError("Failed to load places."));
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <AdminHeader />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-red-400">{error}</p>
        </main>
      </div>
    );
  }

  if (places === null) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Places</h1>
          <p className="text-gray-400 text-sm mt-1">{places.length} locations in the database</p>
        </div>
        <PlacesTable initialPlaces={places} />
      </main>
    </div>
  );
}
