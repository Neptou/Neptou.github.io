"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, setup_secret: setupSecret }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/login");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Registration failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          placeholder="admin"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Setup Secret{" "}
          <span className="text-gray-500 font-normal">(leave blank if not set)</span>
        </label>
        <input
          type="password"
          value={setupSecret}
          onChange={(e) => setSetupSecret(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          placeholder="ADMIN_SETUP_SECRET"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-gray-500 text-xs mt-2">
        <a href="/admin/login" className="text-red-400 hover:text-red-300 transition-colors">
          Back to login
        </a>
      </p>
    </form>
  );
}
