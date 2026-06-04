"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
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
          autoComplete="username"
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
          autoComplete="current-password"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
          placeholder="••••••••"
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
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-gray-500 text-xs mt-4">
        No account?{" "}
        <a href="/admin/setup" className="text-red-400 hover:text-red-300 transition-colors">
          First-time setup
        </a>
      </p>
    </form>
  );
}
