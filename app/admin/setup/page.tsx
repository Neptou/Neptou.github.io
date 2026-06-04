import SetupForm from "@/components/SetupForm";
import { BACKEND_URL } from "@/lib/config";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin Setup — Neptou" };

export default async function SetupPage() {
  const res = await fetch(`${BACKEND_URL}/admin/status`, { cache: "no-store" }).catch(() => null);
  const data = res ? await res.json().catch(() => ({ has_admins: false })) : { has_admins: false };

  if (data.has_admins) redirect("/admin/login");

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
