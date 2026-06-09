"use client";

import { useState } from "react";
import type { Food } from "./FoodsTable";
import { BACKEND_URL } from "@/lib/config";
import { getToken } from "@/lib/auth";

interface Props {
  mode: "add" | "edit";
  food?: Food;
  onSaved: (food: Food) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  "Staples",
  "Street Food",
  "Newari Specials",
  "Dessert",
  "Drink",
  "Snack",
];

export default function FoodModal({ mode, food, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    name: food?.name ?? "",
    name_nepali: food?.name_nepali ?? "",
    description: food?.description ?? "",
    category: food?.category ?? "",
    image_url: food?.image_url ?? "",
    image_name: food?.image_name ?? "",
    is_vegetarian: food?.is_vegetarian ?? false,
    region: food?.region ?? "",
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

    const body = {
      name: form.name,
      name_nepali: form.name_nepali || null,
      description: form.description || null,
      category: form.category || null,
      image_url: form.image_url || null,
      image_name: form.image_name || null,
      is_vegetarian: form.is_vegetarian,
      region: form.region || null,
    };

    const url =
      mode === "edit"
        ? `${BACKEND_URL}/admin/foods/${food!.id}`
        : `${BACKEND_URL}/admin/foods`;
    const token = getToken();

    const res = await fetch(url, {
      method: mode === "edit" ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      onSaved(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? data.error ?? "Failed to save food");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add food" : "Edit food"}
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
                placeholder="Dal Bhat"
              />
            </Field>
            <Field label="Name (Nepali)">
              <input
                type="text"
                value={form.name_nepali}
                onChange={(e) => update("name_nepali", e.target.value)}
                className={inputCls}
                placeholder="दाल भात"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Short description of the dish…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input
                type="text"
                list="food-categories"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputCls}
                placeholder="Staples"
              />
              <datalist id="food-categories">
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Region">
              <input
                type="text"
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                className={inputCls}
                placeholder="Kathmandu Valley"
              />
            </Field>
          </div>

          <Field label="Image URL">
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => update("image_url", e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
          </Field>

          <Field label="Bundled Image Name">
            <input
              type="text"
              value={form.image_name}
              onChange={(e) => update("image_name", e.target.value)}
              className={inputCls}
              placeholder="dal_bhat"
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_vegetarian"
              checked={form.is_vegetarian}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, is_vegetarian: e.target.checked }))
              }
              className="w-4 h-4 accent-red-500"
            />
            <label htmlFor="is_vegetarian" className="text-sm font-medium text-gray-300">
              Vegetarian
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
              {loading ? "Saving…" : mode === "add" ? "Add food" : "Save changes"}
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
