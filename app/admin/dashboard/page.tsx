import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";
import PlacesTable from "@/components/PlacesTable";
import AdminHeader from "@/components/AdminHeader";

export const metadata = { title: "Dashboard — Neptou Admin" };

async function fetchPlaces(token: string) {
  const res = await fetch(`${BACKEND_URL}/admin/places`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  return res.json().catch(() => []);
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value ?? "";
  const places = await fetchPlaces(token);

  if (places === null) redirect("/admin/login");

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
