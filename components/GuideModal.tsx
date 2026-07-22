"use client";

import { useState } from "react";
import type { Guide } from "./GuidesTable";
import { authFetch, AuthError } from "@/lib/auth";
import PlaceMultiSelect, { type PlaceRef } from "./PlaceMultiSelect";

interface Props {
  mode: "add" | "edit";
  guide?: Guide;
  onSaved: (guide: Guide) => void;
  onClose: () => void;
}

const SPECIALTY_OPTIONS = [
  "Trekking",
  "Cultural Tours",
  "Photography",
  "Wildlife",
  "Adventure Sports",
  "Meditation",
  "Food Tours",
  "History",
];

/** number | null helper: "" → null, otherwise Number(). */
function numOrNull(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return isNaN(n) ? null : n;
}

export default function GuideModal({ mode, guide, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    name: guide?.name ?? "",
    name_nepali: guide?.name_nepali ?? "",
    phone: guide?.phone ?? "",
    email: guide?.email ?? "",
    languages: (guide?.languages ?? []).join("\n"),
    rating: guide?.rating != null ? String(guide.rating) : "",
    review_count: guide?.review_count != null ? String(guide.review_count) : "",
    price_per_day: guide?.price_per_day != null ? String(guide.price_per_day) : "",
    bio: guide?.bio ?? "",
    location: guide?.location ?? "",
    license_number: guide?.license_number ?? "",
    image_url: guide?.image_url ?? "",
    image_author: guide?.image_author ?? "",
    image_license: guide?.image_license ?? "",
    image_source_url: guide?.image_source_url ?? "",
    active: guide?.active ?? true,
  });
  const [specialties, setSpecialties] = useState<string[]>(guide?.specialties ?? []);
  // In edit mode, initialize chips from the guide's resolved places; add mode starts empty.
  const [places, setPlaces] = useState<PlaceRef[]>(guide?.places ?? []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSpecialty(s: string) {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const languages = form.languages
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const body = {
      name: form.name,
      name_nepali: form.name_nepali || null,
      phone: form.phone || null,
      email: form.email || null,
      specialties,
      languages,
      rating: numOrNull(form.rating),
      review_count: numOrNull(form.review_count),
      price_per_day: numOrNull(form.price_per_day),
      bio: form.bio || null,
      location: form.location || null,
      place_ids: places.map((p) => p.id),
      license_number: form.license_number || null,
      image_url: form.image_url || null,
      image_author: form.image_author || null,
      image_license: form.image_license || null,
      image_source_url: form.image_source_url || null,
      active: form.active,
    };

    const path = mode === "edit" ? `/admin/guides/${guide!.id}` : `/admin/guides`;

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
      setError(data.detail ?? data.error ?? "Failed to save guide");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add guide" : "Edit guide"}
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
                placeholder="Pemba Sherpa"
              />
            </Field>
            <Field label="Name (Nepali)">
              <input
                type="text"
                value={form.name_nepali}
                onChange={(e) => update("name_nepali", e.target.value)}
                className={inputCls}
                placeholder="पेम्बा शेर्पा"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input
                type="text"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputCls}
                placeholder="+977 …"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputCls}
                placeholder="guide@example.com"
              />
            </Field>
          </div>

          <Field label="Specialties">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SPECIALTY_OPTIONS.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={specialties.includes(s)}
                    onChange={() => toggleSpecialty(s)}
                    className="w-4 h-4 accent-red-500"
                  />
                  {s}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Languages (one per line)">
            <textarea
              value={form.languages}
              onChange={(e) => update("languages", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder={"English\nNepali\nHindi"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating">
              <input
                type="number"
                step="any"
                value={form.rating}
                onChange={(e) => update("rating", e.target.value)}
                className={inputCls}
                placeholder="4.8"
              />
            </Field>
            <Field label="Review count">
              <input
                type="number"
                value={form.review_count}
                onChange={(e) => update("review_count", e.target.value)}
                className={inputCls}
                placeholder="52"
              />
            </Field>
          </div>

          <Field label="Price per day">
            <input
              type="number"
              step="any"
              value={form.price_per_day}
              onChange={(e) => update("price_per_day", e.target.value)}
              className={inputCls}
              placeholder="5000"
            />
          </Field>

          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Short biography of the guide…"
            />
          </Field>

          <Field label="Location">
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className={inputCls}
              placeholder="Kathmandu"
            />
          </Field>

          <Field label="License number">
            <input
              type="text"
              value={form.license_number}
              onChange={(e) => update("license_number", e.target.value)}
              className={inputCls}
              placeholder="TG-12345"
            />
          </Field>

          <Field label="Places covered">
            <PlaceMultiSelect value={places} onChange={setPlaces} />
          </Field>

          <Field label="Image URL">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => update("image_url", e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Photo Author">
              <input
                type="text"
                value={form.image_author}
                onChange={(e) => update("image_author", e.target.value)}
                className={inputCls}
                placeholder="Author name"
              />
            </Field>
            <Field label="License">
              <select
                value={form.image_license}
                onChange={(e) => update("image_license", e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                <option value="CC BY 4.0">CC BY 4.0</option>
                <option value="CC BY-SA 4.0">CC BY-SA 4.0</option>
                <option value="CC BY 3.0">CC BY 3.0</option>
                <option value="CC BY-SA 3.0">CC BY-SA 3.0</option>
                <option value="CC BY 2.0">CC BY 2.0</option>
                <option value="CC BY-SA 2.0">CC BY-SA 2.0</option>
                <option value="CC0 1.0">CC0 1.0 (Public Domain)</option>
                <option value="Public Domain">Public Domain</option>
                <option value="Pexels License">Pexels License</option>
              </select>
            </Field>
          </div>

          <Field label="Image Source URL">
            <input
              type="url"
              value={form.image_source_url}
              onChange={(e) => update("image_source_url", e.target.value)}
              className={inputCls}
              placeholder="https://commons.wikimedia.org/wiki/File:…"
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="guide_active"
              checked={form.active}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, active: e.target.checked }))
              }
              className="w-4 h-4 accent-red-500"
            />
            <label htmlFor="guide_active" className="text-sm font-medium text-gray-300">
              Active
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
              {loading ? "Saving…" : mode === "add" ? "Add guide" : "Save changes"}
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
