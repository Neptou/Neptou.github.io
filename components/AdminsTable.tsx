"use client";

import { useState } from "react";
import AdminModal from "./AdminModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { authFetch, AuthError, RESOURCES } from "@/lib/auth";

export interface Admin {
  id: number;
  username: string;
  role: "super_admin" | "admin";
  permissions: string[];
  is_active: boolean;
  created_at: string;
}

interface Props {
  admins: Admin[];
  meId: number | null;
  onAdminsChange: (updater: (prev: Admin[]) => Admin[]) => void;
}

function permissionLabels(perms: string[]): string {
  if (!perms.length) return "—";
  return perms
    .map((p) => RESOURCES.find((r) => r.key === p)?.label ?? p)
    .join(", ");
}

export default function AdminsTable({ admins, meId, onAdminsChange }: Props) {
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; admin: Admin } | null
  >(null);
  const [resetTarget, setResetTarget] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleDelete(admin: Admin) {
    if (!confirm(`Delete admin "${admin.username}"? This cannot be undone.`))
      return;
    setDeleting(admin.id);
    setActionError("");
    try {
      const res = await authFetch(`/admin/admins/${admin.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to delete");
      }
      onAdminsChange((prev) => prev.filter((a) => a.id !== admin.id));
    } catch (e) {
      if (e instanceof AuthError) return;
      setActionError(
        e instanceof Error ? e.message : `Failed to delete "${admin.username}".`,
      );
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(saved: Admin) {
    onAdminsChange((prev) => {
      const exists = prev.find((a) => a.id === saved.id);
      if (exists) return prev.map((a) => (a.id === saved.id ? saved : a));
      return [...prev, saved];
    });
    setModalState(null);
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          onClick={() => setModalState({ mode: "add" })}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add admin
        </button>
      </div>

      {actionError && <p className="text-red-400 text-sm mb-3">{actionError}</p>}

      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Username</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Role</th>
              <th className="px-4 py-3 text-left">Permissions</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {admin.username}
                  {admin.id === meId && (
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (you)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {admin.role === "super_admin" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-900">
                      Super Admin
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      Admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-md">
                  {admin.role === "super_admin"
                    ? "All resources"
                    : permissionLabels(admin.permissions)}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {admin.is_active ? (
                    <span className="text-emerald-400">✓ Active</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setModalState({ mode: "edit", admin })}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setResetTarget(admin)}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors px-2 py-1"
                    >
                      Reset password
                    </button>
                    {admin.id !== meId && (
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={deleting === admin.id}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors px-2 py-1"
                      >
                        {deleting === admin.id ? "…" : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <AdminModal
          mode={modalState.mode}
          admin={modalState.mode === "edit" ? modalState.admin : undefined}
          onSaved={handleSaved}
          onClose={() => setModalState(null)}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          admin={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}
