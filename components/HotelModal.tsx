"use client";

import { useState } from "react";
import type { Hotel } from "./HotelsTable";
import { authFetch, AuthError } from "@/lib/auth";
import DivisionSelect from "./DivisionSelect";

interface Props {
  mode: "add" | "edit";
  hotel?: Hotel;
  onSaved: (hotel: Hotel) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS = ["Hotel", "Homestay", "Lodge", "Guesthouse", "Resort"];

const LICENSE_OPTIONS = [
  "CC BY 4.0",
  "CC BY-SA 4.0",
  "CC BY 3.0",
  "CC BY-SA 3.0",
  "CC BY 2.0",
  "CC BY-SA 2.0",
  "CC0 1.0",
  "Public Domain",
  "Pexels License",
];

/** Editable gallery row shape (no id/sort_order — backend assigns those). */
interface GalleryRow {
  image_url: string;
  image_author: string;
  image_license: string;
  image_source_url: string;
}

const AMENITY_SUGGESTIONS = [
  "WiFi",
  "Parking",
  "Breakfast",
  "Hot Water",
  "AC",
  "Restaurant",
  "Room Service",
  "Laundry",
];

/** number | null helper: "" → null, otherwise Number(). */
function numOrNull(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return isNaN(n) ? null : n;
}

export default function HotelModal({ mode, hotel, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    name: hotel?.name ?? "",
    name_nepali: hotel?.name_nepali ?? "",
    description: hotel?.description ?? "",
    category: hotel?.category ?? "",
    star_rating: hotel?.star_rating != null ? String(hotel.star_rating) : "",
    latitude: hotel?.latitude != null ? String(hotel.latitude) : "",
    longitude: hotel?.longitude != null ? String(hotel.longitude) : "",
    division_id: hotel?.division_id ?? "",
    address: hotel?.address ?? "",
    phone: hotel?.phone ?? "",
    email: hotel?.email ?? "",
    website: hotel?.website ?? "",
    price_per_night: hotel?.price_per_night != null ? String(hotel.price_per_night) : "",
    amenities: (hotel?.amenities ?? []).join("\n"),
    rating: hotel?.rating != null ? String(hotel.rating) : "",
    review_count: hotel?.review_count != null ? String(hotel.review_count) : "",
    image_url: hotel?.image_url ?? "",
    image_author: hotel?.image_author ?? "",
    image_license: hotel?.image_license ?? "",
    image_source_url: hotel?.image_source_url ?? "",
    active: hotel?.active ?? true,
  });
  const [gallery, setGallery] = useState<GalleryRow[]>(() =>
    [...(hotel?.images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        image_url: img.image_url ?? "",
        image_author: img.image_author ?? "",
        image_license: img.image_license ?? "",
        image_source_url: img.image_source_url ?? "",
      }))
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addGalleryRow() {
    setGallery((prev) => [
      ...prev,
      { image_url: "", image_author: "", image_license: "", image_source_url: "" },
    ]);
  }

  function removeGalleryRow(index: number) {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }

  function updateGalleryRow(index: number, field: keyof GalleryRow, value: string) {
    setGallery((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const amenities = form.amenities
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);

    const body = {
      name: form.name,
      name_nepali: form.name_nepali || null,
      description: form.description || null,
      category: form.category || null,
      star_rating: numOrNull(form.star_rating),
      latitude: numOrNull(form.latitude),
      longitude: numOrNull(form.longitude),
      division_id: form.division_id || null,
      address: form.address || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      price_per_night: numOrNull(form.price_per_night),
      amenities,
      rating: numOrNull(form.rating),
      review_count: numOrNull(form.review_count),
      image_url: form.image_url || null,
      image_author: form.image_author || null,
      image_license: form.image_license || null,
      image_source_url: form.image_source_url || null,
      images: gallery
        .filter((r) => r.image_url.trim())
        .map((r) => ({
          image_url: r.image_url.trim(),
          image_author: r.image_author || null,
          image_license: r.image_license || null,
          image_source_url: r.image_source_url || null,
        })),
      active: form.active,
    };

    const path = mode === "edit" ? `/admin/hotels/${hotel!.id}` : `/admin/hotels`;

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
      setError(data.detail ?? data.error ?? "Failed to save hotel");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add hotel" : "Edit hotel"}
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
                placeholder="Hotel Everest"
              />
            </Field>
            <Field label="Name (Nepali)">
              <input
                type="text"
                value={form.name_nepali}
                onChange={(e) => update("name_nepali", e.target.value)}
                className={inputCls}
                placeholder="होटल एभरेस्ट"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Short description of the property…"
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
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Star rating">
              <select
                value={form.star_rating}
                onChange={(e) => update("star_rating", e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
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
                placeholder="27.7172"
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => update("longitude", e.target.value)}
                className={inputCls}
                placeholder="85.3240"
              />
            </Field>
          </div>

          <Field label="District / Division">
            <DivisionSelect
              value={form.division_id}
              onChange={(id) => update("division_id", id)}
            />
          </Field>

          <Field label="Address">
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className={inputCls}
              placeholder="Thamel, Kathmandu"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input
                type="text"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputCls}
                placeholder="+977 1 …"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputCls}
                placeholder="info@hotel.com"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Website">
              <input
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className={inputCls}
                placeholder="https://…"
              />
            </Field>
            <Field label="Price per night">
              <input
                type="number"
                step="any"
                value={form.price_per_night}
                onChange={(e) => update("price_per_night", e.target.value)}
                className={inputCls}
                placeholder="3500"
              />
            </Field>
          </div>

          <Field label="Amenities (one per line)">
            <textarea
              value={form.amenities}
              onChange={(e) => update("amenities", e.target.value)}
              rows={4}
              className={inputCls + " resize-none"}
              placeholder={"WiFi\nParking\nBreakfast"}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Suggestions: {AMENITY_SUGGESTIONS.join(", ")}
            </p>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating">
              <input
                type="number"
                step="any"
                value={form.rating}
                onChange={(e) => update("rating", e.target.value)}
                className={inputCls}
                placeholder="4.5"
              />
            </Field>
            <Field label="Review count">
              <input
                type="number"
                value={form.review_count}
                onChange={(e) => update("review_count", e.target.value)}
                className={inputCls}
                placeholder="128"
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

          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-300">
                Gallery images
              </label>
              <button
                type="button"
                onClick={addGalleryRow}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                + Add image
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Additional photos beyond the cover image above. Order = display order (top is first).
            </p>

            {gallery.length === 0 ? (
              <p className="text-xs text-gray-600">No gallery images yet.</p>
            ) : (
              <div className="space-y-3">
                {gallery.map((row, i) => (
                  <div
                    key={i}
                    className="border border-gray-800 rounded-lg p-3 bg-gray-950/40 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-5 shrink-0">
                        #{i + 1}
                      </span>
                      <input
                        type="url"
                        value={row.image_url}
                        onChange={(e) =>
                          updateGalleryRow(i, "image_url", e.target.value)
                        }
                        className={inputCls}
                        placeholder="https://… (image URL, required)"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryRow(i)}
                        aria-label="Remove image"
                        className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none px-1 shrink-0"
                      >
                        ×
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-7">
                      <input
                        type="text"
                        value={row.image_author}
                        onChange={(e) =>
                          updateGalleryRow(i, "image_author", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Author name"
                      />
                      <select
                        value={row.image_license}
                        onChange={(e) =>
                          updateGalleryRow(i, "image_license", e.target.value)
                        }
                        className={inputCls}
                      >
                        <option value="">— License —</option>
                        {LICENSE_OPTIONS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pl-7">
                      <input
                        type="url"
                        value={row.image_source_url}
                        onChange={(e) =>
                          updateGalleryRow(i, "image_source_url", e.target.value)
                        }
                        className={inputCls}
                        placeholder="Source URL (https://commons.wikimedia.org/…)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hotel_active"
              checked={form.active}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, active: e.target.checked }))
              }
              className="w-4 h-4 accent-red-500"
            />
            <label htmlFor="hotel_active" className="text-sm font-medium text-gray-300">
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
              {loading ? "Saving…" : mode === "add" ? "Add hotel" : "Save changes"}
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
