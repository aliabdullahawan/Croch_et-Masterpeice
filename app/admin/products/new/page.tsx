/* ════════════════════════════════════════════════════════════════
   app/admin/products/new/page.tsx  —  Add New Product
   ──────────────────────────────────────────────────────────────
   Features:
   - Full product entry form with all fields
   - REAL image upload: click or drag-drop from computer
     → Reads as base64 binary via FileReader
     → Shows live preview thumbnails
     → Stores base64 data URIs (works without Supabase Storage)
   - Inline "Add New Category" dialog
   - Tag manager
   - Status toggles (available, featured, custom)
   - Mobile responsive
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter }         from "next/navigation";
import Image                 from "next/image";
import AdminTopbar           from "@/components/admin/AdminTopbar";
import { useAdmin }          from "@/context/AdminContext";
import { fetchAdminCategories, createAdminProduct, createAdminCategory, getLastAdminDbError } from "@/lib/db-client";
import type { AdminCategory } from "@/lib/admin-types";
import {
  Plus, X, Tag, Save, ChevronLeft,
  Upload, ImageIcon, AlertCircle,
} from "lucide-react";
import { useEffect } from "react";

/* ── Shared input class ─────────────────────────────────────── */
const INPUT = "w-full px-3 py-2.5 rounded-xl border border-[rgba(61,43,31,0.15)] bg-white text-sm font-body text-[#3D2B1F] outline-none focus:border-[#C9A028] focus:ring-2 focus:ring-[rgba(201,40,40,0.12)] transition";
const LABEL = "block text-xs font-semibold text-[#7A5A48] mb-1.5 uppercase tracking-wide";

/* ── Convert File to base64 data URI ─────────────────────────── */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);  // produces "data:image/jpeg;base64,..."
  });
}

/* ══════════════════════════════════════════════════════════════ */
export default function NewProductPage() {
  const { toggleSidebar } = useAdmin();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  /* ── Form state ─────────────────────────────────────────────── */
  const [form, setForm] = useState({
    name:         "",
    description:  "",
    sku:          "",
    price:        "",
    cost:         "",
    stock_qty:    "",
    category_id:  "",
    tags:         [] as string[],
    images:       [] as string[],  // base64 data URIs stored here
    is_available: true,
    is_featured:  false,
    is_custom:    false,
  });
  const [tagInput,  setTagInput]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  /* ── Category state ─────────────────────────────────────────── */
  const [categories,    setCategories]    = useState<AdminCategory[]>([]);
  const [showCatDialog, setShowCatDialog] = useState(false);
  const [newCat,        setNewCat]        = useState({ name: "", description: "" });
  const [catSaving,     setCatSaving]     = useState(false);

  useEffect(() => {
    void (async () => {
      const rows = await fetchAdminCategories();
      setCategories(rows.map((row, index) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: null,
        image_url: null,
        sort_order: index + 1,
        product_count: row.product_count,
      })));
    })();
  }, []);

  /* ── Derived margin ─────────────────────────────────────────── */
  const margin = useMemo(() => {
    const p = parseFloat(form.price), c = parseFloat(form.cost);
    if (p > 0 && c > 0) return `${Math.round(((p - c) / p) * 100)}%`;
    return "—";
  }, [form.price, form.cost]);

  /* ── Field helpers ──────────────────────────────────────────── */
  function set(key: keyof typeof form, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  /* ── Tag management ─────────────────────────────────────────── */
  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  }
  function removeTag(t: string) { set("tags", form.tags.filter(x => x !== t)); }

  /* ── Image upload from computer (base64/binary) ─────────────── */
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) {
        alert(`"${file.name}" is larger than 10 MB. Please choose a smaller image.`);
        continue;
      }
      try {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch {
        console.error("Failed to read image", file.name);
      }
    }
    set("images", [...form.images, ...newImages]);
    setUploading(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset so the same file can be selected again if needed
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  function removeImage(index: number) {
    set("images", form.images.filter((_, i) => i !== index));
  }

  /* ── Inline Add Category ────────────────────────────────────── */
  async function handleAddCategory() {
    if (!newCat.name.trim()) return;
    setCatSaving(true);
    const ok = await createAdminCategory({ name: newCat.name.trim(), description: newCat.description || null });
    if (!ok) {
      setCatSaving(false);
      alert(getLastAdminDbError() ?? "Could not create category. Check admin role and RLS policies.");
      return;
    }
    const rows = await fetchAdminCategories();
    setCategories(rows.map((row, index) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: null,
      image_url: null,
      sort_order: index + 1,
      product_count: row.product_count,
    })));
    const created = rows.find((row) => row.name === newCat.name.trim());
    if (created) {
      setForm((f) => ({ ...f, category_id: String(created.id) }));
    }
    setNewCat({ name: "", description: "" });
    setShowCatDialog(false);
    setCatSaving(false);
  }

  /* ── Validation ─────────────────────────────────────────────── */
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim())   e.name  = "Product name is required";
    if (!form.price)         e.price = "Price is required";
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Enter a valid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Form submit ────────────────────────────────────────────── */
  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const ok = await createAdminProduct({
      category_id: form.category_id ? Number(form.category_id) : null,
      name: form.name.trim(),
      description: form.description,
      sku: form.sku,
      price: form.price ? Number(form.price) : null,
      cost: form.cost ? Number(form.cost) : null,
      stock_qty: form.stock_qty ? Number(form.stock_qty) : 0,
      is_custom: form.is_custom,
      is_available: form.is_available,
      is_featured: form.is_featured,
      images: form.images,
    });
    if (!ok) {
      setSaving(false);
      alert(getLastAdminDbError() ?? "Could not create product. Check admin role and RLS policies.");
      return;
    }
    setSaving(false);
    router.push("/admin/products");
  }

  return (
    <div className="min-h-screen">
      <AdminTopbar
        title="Add New Product"
        subtitle="Fill in all product details below"
        onMenuClick={toggleSidebar}
        actions={
          <a href="/admin/products" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5EDE4] text-[#7A5A48] text-xs font-medium hover:bg-[#EDE0D8] transition">
            <ChevronLeft size={13} /> Back
          </a>
        }
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-16">

        {/* ── Section: Basic Info ──────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">
            Basic Information
          </h2>
          <div>
            <label className={LABEL}>Product Name *</label>
            <input type="text" className={INPUT} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Boho Tote Bag" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea rows={3} className={INPUT} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe this product in detail…" />
          </div>
          <div>
            <label className={LABEL}>SKU / Product Code</label>
            <input type="text" className={INPUT} value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="e.g. BAG-001" />
          </div>
        </section>

        {/* ── Section: Pricing & Inventory ────────────────────── */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">
            Pricing & Inventory
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className={LABEL}>Price (₨) *</label>
              <input type="number" min="0" className={INPUT} value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className={LABEL}>Cost (₨)</label>
              <input type="number" min="0" className={INPUT} value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={LABEL}>Margin</label>
              <div className="px-3 py-2.5 rounded-xl bg-green-50 border border-green-200 text-sm font-semibold text-green-700 text-center">{margin}</div>
            </div>
            <div>
              <label className={LABEL}>Stock Qty</label>
              <input type="number" min="0" className={INPUT} value={form.stock_qty} onChange={e => set("stock_qty", e.target.value)} placeholder="0" />
            </div>
          </div>
        </section>

        {/* ── Section: Category ────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">
            Category
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className={LABEL}>Select Category</label>
              <select className={INPUT} value={form.category_id} onChange={e => set("category_id", e.target.value)}>
                <option value="">— Select a category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.product_count} products)</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowCatDialog(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-[#C9A028] text-[#C9A028] text-xs font-medium hover:bg-amber-50 transition whitespace-nowrap"
              style={{ minHeight: "44px" }}
            >
              <Plus size={13} /> New Category
            </button>
          </div>
        </section>

        {/* ── Section: Tags ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">Tags</h2>
          <div className="flex gap-2">
            <input
              type="text"
              className={`${INPUT} flex-1`}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Type a tag and press Enter"
            />
            <button onClick={addTag} className="px-3 py-2 rounded-xl bg-[#F5EDE4] text-[#7A5A48] hover:bg-[#EDE0D8] transition text-xs font-medium" style={{ minHeight: "44px" }}>
              Add
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 bg-[#EDE0D8] rounded-full text-xs text-[#3D2B1F]">
                  <Tag size={10} /> {t}
                  <button onClick={() => removeTag(t)} className="ml-1 text-[#7A5A48] hover:text-red-500"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Section: Product Images (Upload from Computer) ─────── */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">
            Product Images
          </h2>

          <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <AlertCircle size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Images are stored as binary data directly in the app — no external links needed.
              Supports JPG, PNG, WebP, GIF (max 10 MB each).
            </p>
          </div>

          {/* ── Drag & Drop + Click to Upload zone ──────────────── */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
            style={{
              borderColor: dragging ? "#C9A028" : "rgba(61,43,31,0.2)",
              background:  dragging ? "rgba(201,160,40,0.06)" : "rgba(249,245,240,0.6)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
            <Upload size={32} className="mx-auto mb-3" style={{ color: dragging ? "#C9A028" : "#B0987A" }} />
            <p className="font-body text-sm font-semibold" style={{ color: "#3D2B1F" }}>
              {dragging ? "Drop images here!" : "Click to choose images from your computer"}
            </p>
            <p className="font-body text-xs mt-1" style={{ color: "#7A5A48" }}>
              or drag &amp; drop • Multiple images supported • JPG, PNG, WebP
            </p>
            {uploading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#C9A028]">
                <div className="w-4 h-4 border-2 border-[#C9A028] border-t-transparent rounded-full animate-spin" />
                Processing images…
              </div>
            )}
          </div>

          {/* ── Image Previews ───────────────────────────────────── */}
          {form.images.length > 0 && (
            <div>
              <p className="text-xs text-[#7A5A48] mb-3 font-medium">{form.images.length} image{form.images.length !== 1 ? "s" : ""} added</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {form.images.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-[rgba(61,43,31,0.12)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Product image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <button
                        onClick={e => { e.stopPropagation(); removeImage(i); }}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center transition-opacity hover:bg-red-600"
                        title="Remove image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#C9A028] text-white">Main</span>
                    )}
                  </div>
                ))}
                {/* Add more button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-[rgba(61,43,31,0.2)] flex flex-col items-center justify-center gap-1 hover:border-[#C9A028] hover:bg-amber-50 transition-all cursor-pointer"
                >
                  <ImageIcon size={20} style={{ color: "#B0987A" }} />
                  <span className="text-[10px] text-[#7A5A48]">Add more</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Section: Status Toggles ───────────────────────────── */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2 mb-4">
            Product Status
          </h2>
          <div className="space-y-3">
            {([
              { key: "is_available" as const, label: "Available for sale",     desc: "Customers can view and order this product" },
              { key: "is_featured"  as const, label: "Featured product",       desc: "Show in featured section on the store" },
              { key: "is_custom"    as const, label: "Custom / made-to-order", desc: "This is a custom product with no set stock" },
            ] as const).map(({ key, label, desc }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group" style={{ minHeight: "44px" }}>
                <div
                  onClick={() => set(key, !form[key])}
                  className={`w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 relative cursor-pointer ${form[key] ? "bg-[#C9A028]" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#3D2B1F]">{label}</div>
                  <div className="text-xs text-[#7A5A48]">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* ── Save button ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <a href="/admin/products" className="px-5 py-2.5 rounded-xl border border-[rgba(61,43,31,0.15)] text-sm font-medium text-[#3D2B1F] hover:bg-[#F5EDE4] transition text-center">
            Cancel
          </a>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A028] text-white text-sm font-semibold hover:bg-[#E2B84A] disabled:opacity-60 transition shadow"
            style={{ minHeight: "44px" }}
          >
            <Save size={15} />
            {saving ? "Saving…" : "Save Product"}
          </button>
        </div>

      </div>

      {/* ══ Add Category Dialog ══════════════════════════════════ */}
      {showCatDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => e.target === e.currentTarget && setShowCatDialog(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 w-full sm:max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-[#3D2B1F]">Add New Category</h3>
              <button onClick={() => setShowCatDialog(false)} className="text-[#7A5A48] hover:text-[#3D2B1F] w-8 h-8 flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={LABEL}>Category Name *</label>
                <input type="text" className={INPUT} value={newCat.name} onChange={e => setNewCat(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Wall Art" autoFocus />
              </div>
              <div>
                <label className={LABEL}>Description (optional)</label>
                <input type="text" className={INPUT} value={newCat.description} onChange={e => setNewCat(n => ({ ...n, description: e.target.value }))} placeholder="Briefly describe this category" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="flex-1 py-2.5 rounded-xl border border-[rgba(61,43,31,0.15)] text-sm font-medium text-[#3D2B1F] hover:bg-[#F5EDE4] transition" onClick={() => setShowCatDialog(false)}>
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-[#C9A028] text-white text-sm font-semibold hover:bg-[#E2B84A] disabled:opacity-60 transition"
                onClick={handleAddCategory}
                disabled={catSaving || !newCat.name.trim()}
              >
                {catSaving ? "Creating…" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
