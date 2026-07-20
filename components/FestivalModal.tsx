"use client";

import { useEffect, useState } from "react";
import type { Festival } from "./FestivalsTable";
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
  festival?: Festival;
  onSaved: (festival: Festival) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  "Jatra",
  "Religious Festival",
  "National Holiday",
  "Cultural",
  "Harvest",
];

const NEPALI_MONTHS = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

export default function FestivalModal({
  mode,
  festival,
  onSaved,
  onClose,
}: Props) {
  const [form, setForm] = useState({
    name: festival?.name ?? "",
    name_nepali: festival?.name_nepali ?? "",
    description: festival?.description ?? "",
    significance: festival?.significance ?? "",
    category: festival?.category ?? "",
    start_date: festival?.start_date ?? "",
    end_date: festival?.end_date ?? "",
    nepali_date: festival?.nepali_date ?? "",
    nepali_month: festival?.nepali_month ?? "",
    duration_days: festival?.duration_days?.toString() ?? "",
    is_recurring: festival?.is_recurring ?? true,
    division_id: festival?.division_id ?? "",
    place_id: festival?.place_id ?? "",
    region: festival?.region ?? "",
    image_url: festival?.image_url ?? "",
    image_name: festival?.image_name ?? "",
    image_author: festival?.image_author ?? "",
    image_license: festival?.image_license ?? "",
    image_source_url: festival?.image_source_url ?? "",
    // New festivals default to active; only an explicit false hides them from the app.
    is_active: festival?.is_active ?? true,
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
      significance: form.significance || null,
      category: form.category || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      nepali_date: form.nepali_date || null,
      nepali_month: form.nepali_month || null,
      duration_days: form.duration_days ? parseInt(form.duration_days) : null,
      is_recurring: form.is_recurring,
      division_id: form.division_id || null,
      place_id: form.place_id || null,
      region: form.region || null,
      image_url: form.image_url || null,
      image_name: form.image_name || null,
      image_author: form.image_author || null,
      image_license: form.image_license || null,
      image_source_url: form.image_source_url || null,
      is_active: form.is_active,
    };

    const path =
      mode === "edit" ? `/admin/festivals/${festival!.id}` : `/admin/festivals`;

    let res: Response;
    try {
      res = await authFetch(path, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      setLoading(false);
      if (!(e instanceof AuthError))
        setError("Network error — please try again.");
      return;
    }

    setLoading(false);

    if (res.ok) {
      onSaved(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? data.error ?? "Failed to save festival");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add festival" : "Edit festival"}
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
                placeholder="Bisket Jatra"
              />
            </Field>
            <Field label="Name (Nepali)">
              <input
                type="text"
                value={form.name_nepali}
                onChange={(e) => update("name_nepali", e.target.value)}
                className={inputCls}
                placeholder="बिस्केट जात्रा"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              className={inputCls + " resize-none"}
              placeholder="Short summary of the festival…"
            />
          </Field>

          <Field label="Significance / Information">
            <textarea
              value={form.significance}
              onChange={(e) => update("significance", e.target.value)}
              rows={4}
              className={inputCls + " resize-none"}
              placeholder="History, rituals, why it is celebrated…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input
                type="text"
                list="festival-categories"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputCls}
                placeholder="Jatra"
              />
              <datalist id="festival-categories">
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Duration (days)">
              <input
                type="number"
                min="1"
                value={form.duration_days}
                onChange={(e) => update("duration_days", e.target.value)}
                className={inputCls}
                placeholder="9"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date (Gregorian)">
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update("start_date", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="End date (Gregorian)">
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => update("end_date", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nepali date (display)">
              <input
                type="text"
                value={form.nepali_date}
                onChange={(e) => update("nepali_date", e.target.value)}
                className={inputCls}
                placeholder="Baishakh 1, 2083"
              />
            </Field>
            <Field label="Nepali month">
              <select
                value={form.nepali_month}
                onChange={(e) => update("nepali_month", e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {NEPALI_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="District (division)">
              <select
                value={form.division_id}
                onChange={(e) => update("division_id", e.target.value)}
                className={inputCls}
              >
                <option value="">— None / Nationwide —</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {divisionLabel(d)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Region (free text)">
              <input
                type="text"
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                className={inputCls}
                placeholder="Bhaktapur / Nationwide"
              />
            </Field>
          </div>

          <Field label="Place ID (optional)">
            <input
              type="text"
              value={form.place_id}
              onChange={(e) => update("place_id", e.target.value)}
              className={inputCls}
              placeholder="places.id of the specific venue (optional)"
            />
          </Field>

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

          <Field label="Bundled Image Name">
            <input
              type="text"
              value={form.image_name}
              onChange={(e) => update("image_name", e.target.value)}
              className={inputCls}
              placeholder="bisket_jatra"
            />
          </Field>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_recurring"
                checked={form.is_recurring}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_recurring: e.target.checked }))
                }
                className="w-4 h-4 accent-red-500"
              />
              <label
                htmlFor="is_recurring"
                className="text-sm font-medium text-gray-300"
              >
                Recurs annually
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 accent-emerald-500"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-300"
              >
                Active{" "}
                <span className="text-gray-500 font-normal">(shown in app)</span>
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
              {loading
                ? "Saving…"
                : mode === "add"
                  ? "Add festival"
                  : "Save changes"}
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
