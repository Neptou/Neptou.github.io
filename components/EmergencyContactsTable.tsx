"use client";

import { useState } from "react";
import EmergencyContactModal from "./EmergencyContactModal";
import { authFetch, AuthError } from "@/lib/auth";
import { formatVerified, verifyRecord } from "@/lib/verify";

export interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  category: string | null;
  province: string | null;
  description: string | null;
  available_24_7: boolean;
  languages: string[] | null;
  additional_info: string | null;
  last_verified: string | null;
  source_note: string | null;
  // Admin verify workflow (distinct from the domain `last_verified` date above).
  verified?: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
}

interface Props {
  contacts: EmergencyContact[];
  onContactsChange: (updater: (prev: EmergencyContact[]) => EmergencyContact[]) => void;
}

export default function EmergencyContactsTable({ contacts, onContactsChange }: Props) {
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; contact: EmergencyContact } | null
  >(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleVerify(contact: EmergencyContact, verified: boolean) {
    setVerifying(contact.id);
    setActionError("");
    try {
      const v = await verifyRecord("/admin/emergency-contacts", contact.id, verified);
      onContactsChange((prev) => prev.map((c) => (c.id === contact.id ? { ...c, ...v } : c)));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to update "${contact.name}".`);
    } finally {
      setVerifying(null);
    }
  }

  async function handleDelete(contact: EmergencyContact) {
    if (!confirm(`Delete "${contact.name}"? This cannot be undone.`)) return;
    setDeleting(contact.id);
    setActionError("");
    try {
      const res = await authFetch(`/admin/emergency-contacts/${contact.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onContactsChange((prev) => prev.filter((c) => c.id !== contact.id));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to delete "${contact.name}".`);
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(saved: EmergencyContact) {
    onContactsChange((prev) => {
      const exists = prev.find((c) => c.id === saved.id);
      if (exists) return prev.map((c) => (c.id === saved.id ? saved : c));
      return [saved, ...prev];
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
          + Add contact
        </button>
      </div>

      {actionError && <p className="text-red-400 text-sm mb-3">{actionError}</p>}

      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Phone</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Category</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Province</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">24/7</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Languages</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Last verified</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Verified</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {contacts.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No emergency contacts found.
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {c.name}
                </td>
                <td className="px-4 py-3 text-gray-300 font-mono text-xs whitespace-nowrap">
                  {c.phone}
                </td>
                <td className="px-4 py-3">
                  {c.category ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {c.category}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {c.province ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-md truncate">
                  {c.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {c.available_24_7 ? (
                    <span className="text-emerald-400">✓ 24/7</span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {c.languages && c.languages.length > 0
                    ? c.languages.join(", ")
                    : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {c.last_verified ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {c.verified ? (
                    <span className="text-xs text-emerald-400">
                      ✓ Verified
                      {formatVerified(c.verified_at) && (
                        <span className="block text-gray-500">
                          {formatVerified(c.verified_at)}
                          {c.verified_by ? ` · ${c.verified_by}` : ""}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">○ Needs review</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleVerify(c, !c.verified)}
                      disabled={verifying === c.id}
                      className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {verifying === c.id ? "…" : c.verified ? "Un-verify" : "Mark verified"}
                    </button>
                    <button
                      onClick={() => setModalState({ mode: "edit", contact: c })}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={deleting === c.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {deleting === c.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <EmergencyContactModal
          mode={modalState.mode}
          contact={modalState.mode === "edit" ? modalState.contact : undefined}
          onSaved={handleSaved}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
