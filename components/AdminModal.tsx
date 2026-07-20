"use client";

import { useState } from "react";
import type { Admin } from "./AdminsTable";
import { authFetch, AuthError, RESOURCES, type AdminRole } from "@/lib/auth";

interface Props {
  mode: "add" | "edit";
  admin?: Admin;
  onSaved: (admin: Admin) => void;
  onClose: () => void;
}

export default function AdminModal({ mode, admin, onSaved, onClose }: Props) {
  const [username, setUsername] = useState(admin?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>(admin?.role ?? "admin");
  const [permissions, setPermissions] = useState<string[]>(
    admin?.permissions ?? [],
  );
  const [isActive, setIsActive] = useState(admin?.is_active ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function togglePermission(key: string) {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "add" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);

    const path = mode === "edit" ? `/admin/admins/${admin!.id}` : `/admin/admins`;
    const body =
      mode === "edit"
        ? { role, permissions, is_active: isActive }
        : { username, password, role, permissions };

    let res: Response;
    try {
      res = await authFetch(path, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      setLoading(false);
      if (!(e instanceof AuthError)) setError("Network error — please try again.");
      return;
    }

    setLoading(false);
    if (res.ok) {
      onSaved(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? data.error ?? "Failed to save admin");
    }
  }

  const isSuper = role === "super_admin";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add admin" : `Edit ${admin?.username}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "add" ? (
            <>
              <Field label="Username" required>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={inputCls}
                  autoComplete="off"
                  placeholder="teammate"
                />
              </Field>
              <Field label="Temporary password" required>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={inputCls}
                  autoComplete="off"
                  placeholder="At least 8 characters"
                />
              </Field>
            </>
          ) : (
            <Field label="Username">
              <input
                type="text"
                value={admin?.username ?? ""}
                disabled
                className={inputCls + " opacity-60 cursor-not-allowed"}
              />
            </Field>
          )}

          <Field label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className={inputCls}
            >
              <option value="admin">Admin (limited to selected resources)</option>
              <option value="super_admin">Super Admin (full access + team)</option>
            </select>
          </Field>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Permissions
            </label>
            {isSuper ? (
              <p className="text-xs text-gray-500 bg-gray-800/50 border border-gray-800 rounded-lg px-3 py-2">
                Super admins have full access to every resource and team
                management.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {RESOURCES.map((r) => (
                  <label
                    key={r.key}
                    className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 border border-gray-800 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(r.key)}
                      onChange={() => togglePermission(r.key)}
                      className="w-4 h-4 accent-red-500"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {mode === "edit" && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="admin_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              <label
                htmlFor="admin_active"
                className="text-sm font-medium text-gray-300"
              >
                Active{" "}
                <span className="text-gray-500 font-normal">
                  (can sign in)
                </span>
              </label>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Saving…" : mode === "add" ? "Add admin" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
