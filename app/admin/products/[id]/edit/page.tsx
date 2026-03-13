/* ════════════════════════════════════════════════════════════════
   app/admin/products/[id]/edit/page.tsx  —  Edit Product
   Same form as /products/new but pre-filled with existing data.
   TODO: Supabase — fetch product by id and populate form
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminTopbar           from "@/components/admin/AdminTopbar";
import { useAdmin }          from "@/context/AdminContext";
import { getMockProducts, getMockCategories } from "@/lib/admin-mock-data";
import type { AdminCategory } from "@/lib/admin-types";
import { Save, ChevronLeft, Plus, X, Tag, Upload, ImageIcon, AlertCircle } from "lucide-react";

/* ── Convert File to base64 data URI ─────────────────────── */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const INPUT = "w-full px-3 py-2 rounded-xl border border-[rgba(61,43,31,0.15)] bg-white text-sm font-body text-[#3D2B1F] outline-none focus:border-[#C9A028] focus:ring-2 focus:ring-[rgba(201,160,40,0.12)] transition";
const LABEL = "block text-xs font-semibold text-[#7A5A48] mb-1.5 uppercase tracking-wide";

export default function EditProductPage() {
  const { toggleSidebar } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  /* ── Load product data
   * TODO: Supabase — const { data: product } = await supabase
   *   .from('products').select('*').eq('id', productId).single()
   */
  const products   = useMemo(() => getMockProducts(), []);
  const product    = products.find((p) => p.id === productId);
  const [categories, setCategories] = useState<AdminCategory[]>(() => getMockCategories());

  /* ── Form state — pre-filled from existing product ────────── */
  const [form, setForm] = useState({
    name:         product?.name         ?? "",
    description:  product?.description  ?? "",
    sku:          product?.sku          ?? "",
    price:        product?.price?.toString() ?? "",
    cost:         product?.cost?.toString()  ?? "",
    stock_qty:    product?.stock_qty?.toString() ?? "",
    category_id:  product?.category_id?.toString() ?? "",
    tags:         product?.tags         ?? [] as string[],
    images:       product?.images       ?? [] as string[],
    is_available: product?.is_available ?? true,
    is_featured:  product?.is_featured  ?? false,
    is_custom:    product?.is_custom    ?? false,
  });
  const [tagInput,   setTagInput]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [showCatDialog, setShowCatDialog] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", description: "" });
  const [catSaving, setCatSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(key: keyof typeof form, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  const margin = useMemo(() => {
    const p = parseFloat(form.price), c = parseFloat(form.cost);
    return p > 0 && c > 0 ? `${Math.round(((p - c) / p) * 100)}%` : "—";
  }, [form.price, form.cost]);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  }

  /* ── Image upload from computer (base64/binary) ─────────── */
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) { alert(`"${file.name}" exceeds 10 MB.`); continue; }
      try { newImages.push(await fileToBase64(file)); } catch { /* skip */ }
    }
    set("images", [...form.images, ...newImages]);
    setUploading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.images]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files); e.target.value = "";
  };

  async function handleAddCategory() {
    if (!newCat.name.trim()) return;
    setCatSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const created: AdminCategory = {
      id: Math.max(...categories.map((c) => c.id)) + 1,
      name: newCat.name.trim(),
      slug: newCat.name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newCat.description || null,
      image_url: null,
      sort_order: categories.length + 1,
      product_count: 0,
    };
    setCategories((p) => [...p, created]);
    set("category_id", String(created.id));
    setNewCat({ name: "", description: "" });
    setShowCatDialog(false);
    setCatSaving(false);
  }

  /* ── Save (update)
   * TODO: Supabase — await supabase.from('products').update({ ...formData }).eq('id', productId)
   */
  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    router.push("/admin/products");
  }

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#7A5A48] mb-3">Product not found.</p>
        <a href="/admin/products" className="text-[#C9A028] hover:underline text-sm">← Back to Products</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <AdminTopbar
        title={`Edit: ${product.name}`}
        subtitle="Update product details"
        onMenuClick={toggleSidebar}
        actions={
          <a href="/admin/products" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5EDE4] text-[#7A5A48] text-xs font-medium hover:bg-[#EDE0D8] transition">
            <ChevronLeft size={13} /> Back
          </a>
        }
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-16">

        {/* Basic Info */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">Basic Information</h2>
          <div>
            <label className={LABEL}>Product Name *</label>
            <input type="text" className={INPUT} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea rows={3} className={INPUT} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>SKU</label>
            <input type="text" className={INPUT} value={form.sku} onChange={(e) => set("sku", e.target.value)} />
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className={LABEL}>Price (₨) *</label><input type="number" min="0" className={INPUT} value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
            <div><label className={LABEL}>Cost (₨)</label><input type="number" min="0" className={INPUT} value={form.cost} onChange={(e) => set("cost", e.target.value)} /></div>
            <div><label className={LABEL}>Margin</label><div className="px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-sm font-semibold text-green-700 text-center">{margin}</div></div>
            <div><label className={LABEL}>Stock Qty</label><input type="number" min="0" className={INPUT} value={form.stock_qty} onChange={(e) => set("stock_qty", e.target.value)} /></div>
          </div>
        </section>

        {/* Category */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">Category</h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className={LABEL}>Select Category</label>
              <select className={INPUT} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">— Select —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button onClick={() => setShowCatDialog(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-[#C9A028] text-[#C9A028] text-xs font-medium hover:bg-amber-50 transition whitespace-nowrap">
              <Plus size={13} /> New Category
            </button>
          </div>
        </section>

        {/* Images — Upload from Computer */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">Product Images</h2>
          <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <AlertCircle size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">Images are stored as binary data directly — no external links needed.</p>
          </div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all"
            style={{ borderColor: dragging ? "#C9A028" : "rgba(61,43,31,0.2)", background: dragging ? "rgba(201,160,40,0.06)" : "rgba(249,245,240,0.6)" }}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            <Upload size={28} className="mx-auto mb-2" style={{ color: dragging ? "#C9A028" : "#B0987A" }} />
            <p className="font-body text-sm font-semibold" style={{ color: "#3D2B1F" }}>
              {dragging ? "Drop images here!" : "Click to choose images from your computer"}
            </p>
            <p className="font-body text-xs mt-1" style={{ color: "#7A5A48" }}>or drag &amp; drop • JPG, PNG, WebP up to 10 MB</p>
            {uploading && <p className="text-xs text-[#C9A028] mt-2">Processing…</p>}
          </div>
          {form.images.length > 0 && (
            <div>
              <p className="text-xs text-[#7A5A48] mb-3">{form.images.length} image(s)</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {form.images.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-[rgba(61,43,31,0.12)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Image ${i+1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <button onClick={e => { e.stopPropagation(); set("images", form.images.filter((_, j) => j !== i)); }}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center transition-opacity">
                        <X size={13} />
                      </button>
                    </div>
                    {i === 0 && <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#C9A028] text-white">Main</span>}
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-[rgba(61,43,31,0.2)] flex flex-col items-center justify-center gap-1 hover:border-[#C9A028] hover:bg-amber-50 transition-all cursor-pointer">
                  <ImageIcon size={18} style={{ color: "#B0987A" }} />
                  <span className="text-[10px] text-[#7A5A48]">Add more</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Tags */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2">Tags</h2>
          <div className="flex gap-2">
            <input type="text" className={`${INPUT} flex-1`} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Type and press Enter" />
            <button onClick={addTag} className="px-3 py-2 rounded-xl bg-[#F5EDE4] text-[#7A5A48] hover:bg-[#EDE0D8] transition text-xs font-medium">Add</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 bg-[#EDE0D8] rounded-full text-xs text-[#3D2B1F]">
                  <Tag size={10} /> {t}
                  <button onClick={() => set("tags", form.tags.filter((x) => x !== t))} className="ml-1 text-[#7A5A48] hover:text-red-500"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Status Toggles */}
        <section className="bg-white rounded-2xl border border-[rgba(61,43,31,0.08)] shadow-sm p-6">
          <h2 className="font-display text-base font-semibold text-[#3D2B1F] border-b border-[rgba(61,43,31,0.08)] pb-2 mb-4">Status</h2>
          <div className="space-y-3">
            {([
              { key: "is_available" as const, label: "Available for sale",      desc: "Customers can view and order this" },
              { key: "is_featured"  as const, label: "Featured product",        desc: "Show in featured section"           },
              { key: "is_custom"    as const, label: "Custom / made-to-order",  desc: "No fixed stock"                    },
            ] as const).map(({ key, label, desc }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => set(key, !form[key])} className={`w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 relative cursor-pointer ${form[key] ? "bg-[#C9A028]" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <div><div className="text-sm font-medium text-[#3D2B1F]">{label}</div><div className="text-xs text-[#7A5A48]">{desc}</div></div>
              </label>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex gap-3 justify-end">
          <a href="/admin/products" className="px-5 py-2.5 rounded-xl border border-[rgba(61,43,31,0.15)] text-sm font-medium text-[#3D2B1F] hover:bg-[#F5EDE4] transition">Cancel</a>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A028] text-white text-sm font-semibold hover:bg-[#E2B84A] disabled:opacity-60 transition shadow">
            <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </div>

      {/* Add Category Dialog */}
      {showCatDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowCatDialog(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-[#3D2B1F]">Add New Category</h3>
              <button onClick={() => setShowCatDialog(false)} className="text-[#7A5A48]"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className={LABEL}>Name *</label><input type="text" className={INPUT} value={newCat.name} onChange={(e) => setNewCat((n) => ({ ...n, name: e.target.value }))} autoFocus /></div>
              <div><label className={LABEL}>Description</label><input type="text" className={INPUT} value={newCat.description} onChange={(e) => setNewCat((n) => ({ ...n, description: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="flex-1 py-2 rounded-xl border border-[rgba(61,43,31,0.15)] text-sm font-medium hover:bg-[#F5EDE4] transition" onClick={() => setShowCatDialog(false)}>Cancel</button>
              <button className="flex-1 py-2 rounded-xl bg-[#C9A028] text-white text-sm font-semibold hover:bg-[#E2B84A] disabled:opacity-60 transition" onClick={handleAddCategory} disabled={catSaving || !newCat.name.trim()}>
                {catSaving ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
