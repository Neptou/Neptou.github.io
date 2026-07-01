"use client";

import { useState } from "react";
import type { EmergencyContact } from "./EmergencyContactsTable";
import { authFetch, AuthError } from "@/lib/auth";

interface Props {
  mode: "add" | "edit";
  contact?: EmergencyContact;
  onSaved: (contact: EmergencyContact) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  "Police",
  "Tourist",
  "Medical",
  "Fire",
  "Embassy",
  "Local Agent",
];

export default function EmergencyContactModal({ mode, contact, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    name: contact?.name ?? "",
    phone: contact?.phone ?? "",
    category: contact?.category ?? "",
    province: contact?.province ?? "",
    description: contact?.description ?? "",
    available_24_7: contact?.available_24_7 ?? false,
    languages: (contact?.languages ?? []).join(", "),
    additional_info: contact?.additional_info ?? "",
    last_verified: contact?.last_verified ?? "",
    source_note: contact?.source_note ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const languages = form.languages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      name: form.name,
      phone: form.phone,
      category: form.category || null,
      province: form.province || null,
      description: form.description || null,
      available_24_7: form.available_24_7,
      languages: languages.length ? languages : null,
      additional_info: form.additional_info || null,
      last_verified: form.last_verified || null,
      source_note: form.source_note || null,
    };

    const path =
      mode === "edit"
        ? `/admin/emergency-contacts/${contact!.id}`
        : `/admin/emergency-contacts`;

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
      setError(data.detail ?? data.error ?? "Failed to save contact");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add emergency contact" : "Edit emergency contact"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className={inputCls}
                placeholder="Tourist Police"
              />
            </Field>
            <Field label="Phone" required>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
                className={inputCls}
                placeholder="+977-1-4247041"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Province">
              <input
                type="text"
                value={form.province}
                onChange={(e) => update("province", e.target.value)}
                className={inputCls}
                placeholder="Bagmati"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Last Verified">
              <input
                type="date"
                value={form.last_verified}
                onChange={(e) => update("last_verified", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              className={inputCls + " resize-none"}
              placeholder="Short description of who this is and when to call them…"
            />
          </Field>

          <Field label="Languages (comma-separated)">
            <input
              type="text"
              value={form.languages}
              onChange={(e) => update("languages", e.target.value)}
              className={inputCls}
              placeholder="Nepali, English, Hindi"
            />
          </Field>

          <Field label="Additional Info">
            <textarea
              value={form.additional_info}
              onChange={(e) => update("additional_info", e.target.value)}
              rows={2}
              className={inputCls + " resize-none"}
              placeholder="Hours, location notes, restrictions…"
            />
          </Field>

          <Field label="Source Note">
            <input
              type="text"
              value={form.source_note}
              onChange={(e) => update("source_note", e.target.value)}
              className={inputCls}
              placeholder="Where this contact was verified from"
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available_24_7"
              checked={form.available_24_7}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, available_24_7: e.target.checked }))
              }
              className="w-4 h-4 accent-red-500"
            />
            <label htmlFor="available_24_7" className="text-sm font-medium text-gray-300">
              Available 24/7
            </label>
          </div>

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
              {loading ? "Saving…" : mode === "add" ? "Add contact" : "Save changes"}
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
