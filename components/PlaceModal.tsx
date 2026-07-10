"use client";

import { useEffect, useState } from "react";
import type { Place } from "./PlacesTable";
import { authFetch, AuthError } from "@/lib/auth";

interface Division {
  id: string;
  country: string | null;
  state: string | null;
  district: string | null;
  municipality: string | null;
}

interface Props {
  mode: "add" | "edit";
  place?: Place;
  onSaved: (place: Place) => void;
  onClose: () => void;
}

export default function PlaceModal({ mode, place, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    name: place?.name ?? "",
    name_nepali: place?.name_nepali ?? "",
    description: place?.description ?? "",
    category: place?.category ?? "",
    latitude: place?.latitude?.toString() ?? "",
    longitude: place?.longitude?.toString() ?? "",
    geohash: place?.geohash ?? "",
    is_hidden_gem: place?.is_hidden_gem ?? false,
    // New places default to active; only an explicit false hides them from iOS.
    active: place?.active ?? true,
    tips: (place?.tips ?? []).join("\n"),
    rating: place?.rating?.toString() ?? "",
    review_count: place?.review_count?.toString() ?? "",
    opening_hours: place?.opening_hours ?? "",
    entry_fee: place?.entry_fee ?? "",
    image_url: place?.image_url ?? "",
    image_author: place?.image_author ?? "",
    image_license: place?.image_license ?? "",
    image_source_url: place?.image_source_url ?? "",
    division_id: place?.division_id ?? "",
  });
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authFetch(`/admin/divisions`)
      .then((r) => r.json())
      .then(setDivisions)
      .catch(() => {});
  }, []);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function divisionLabel(d: Division) {
    return [d.municipality, d.district, d.state, d.country]
      .filter(Boolean)
      .join(" › ");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      name: form.name,
      name_nepali: form.name_nepali || null,
      description: form.description || null,
      category: form.category || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      geohash: form.geohash || null,
      is_hidden_gem: form.is_hidden_gem,
      active: form.active,
      // One tip per line; trim and drop blanks. Sent as an array so the backend
      // (COALESCE(tips)) persists edits instead of leaving tips untouched.
      tips: form.tips
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      rating: form.rating ? parseFloat(form.rating) : null,
      review_count: form.review_count ? parseInt(form.review_count) : null,
      opening_hours: form.opening_hours || null,
      entry_fee: form.entry_fee || null,
      image_url: form.image_url || null,
      image_author: form.image_author || null,
      image_license: form.image_license || null,
      image_source_url: form.image_source_url || null,
      division_id: form.division_id || null,
    };

    const path =
      mode === "edit" ? `/admin/places/${place!.id}` : `/admin/places`;

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
      setError(data.detail ?? data.error ?? "Failed to save place");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add place" : "Edit place"}
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
                placeholder="Swayambhunath"
              />
            </Field>
            <Field label="Name (Nepali)">
              <input
                type="text"
                value={form.name_nepali}
                onChange={(e) => update("name_nepali", e.target.value)}
                className={inputCls}
                placeholder="स्वयम्भूनाथ"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Short description of the place…"
            />
          </Field>

          <Field label="Tips (one per line)">
            <textarea
              value={form.tips}
              onChange={(e) => update("tips", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder={"Arrive early to avoid crowds\nCarry cash for the entry fee"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {["temple", "trek", "food", "culture", "nature", "viewpoint"].map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </Field>
            <Field label="Division">
              <select
                value={form.division_id}
                onChange={(e) => update("division_id", e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {divisionLabel(d)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => update("latitude", e.target.value)}
                className={inputCls}
                placeholder="27.7149"
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => update("longitude", e.target.value)}
                className={inputCls}
                placeholder="85.3480"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => update("rating", e.target.value)}
                className={inputCls}
                placeholder="4.8"
              />
            </Field>
            <Field label="Review Count">
              <input
                type="number"
                min="0"
                value={form.review_count}
                onChange={(e) => update("review_count", e.target.value)}
                className={inputCls}
                placeholder="0"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Opening Hours">
              <input
                type="text"
                value={form.opening_hours}
                onChange={(e) => update("opening_hours", e.target.value)}
                className={inputCls}
                placeholder="6:00 AM – 7:00 PM"
              />
            </Field>
            <Field label="Entry Fee">
              <input
                type="text"
                value={form.entry_fee}
                onChange={(e) => update("entry_fee", e.target.value)}
                className={inputCls}
                placeholder="NPR 1000 (Foreigners)"
              />
            </Field>
          </div>

          <Field label="Image URL">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => update("image_url", e.target.value)}
              className={inputCls}
              placeholder="https://upload.wikimedia.org/…"
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

          <Field label="Wikimedia Source URL">
            <input
              type="url"
              value={form.image_source_url}
              onChange={(e) => update("image_source_url", e.target.value)}
              className={inputCls}
              placeholder="https://commons.wikimedia.org/wiki/File:…"
            />
          </Field>

          <Field label="Geohash">
            <input
              type="text"
              value={form.geohash}
              onChange={(e) => update("geohash", e.target.value)}
              className={inputCls}
              placeholder="tuvz1"
            />
          </Field>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_hidden_gem"
                checked={form.is_hidden_gem}
                onChange={(e) => setForm((prev) => ({ ...prev, is_hidden_gem: e.target.checked }))}
                className="w-4 h-4 accent-red-500"
              />
              <label htmlFor="is_hidden_gem" className="text-sm font-medium text-gray-300">
                Hidden Gem
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-300">
                Active <span className="text-gray-500 font-normal">(shown in app)</span>
              </label>
            </div>
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
              {loading ? "Saving…" : mode === "add" ? "Add place" : "Save changes"}
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
