/* ════════════════════════════════════════════════════════════════
   app/admin/categories/page.tsx  —  Categories Management
   ──────────────────────────────────────────────────────────────
   Features:
   - Category cards grid with product count
   - Add / Edit / Delete category via inline dialog
   - Instant update of local state (Supabase insert/update later)
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import AdminTopbar            from "@/components/admin/AdminTopbar";
import { useAdmin }           from "@/context/AdminContext";
import { fetchAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory, getLastAdminDbError }  from "@/lib/db-client";
import type { AdminCategory } from "@/lib/admin-types";
import { Plus, Edit2, Trash2, Tag, X, Save, Package } from "lucide-react";

const INPUT = "w-full px-3 py-2 rounded-xl border border-brand-cream/15 bg-brand-base/50 text-sm font-body text-brand-cream outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/12 transition";
const LABEL = "block text-xs font-semibold text-brand-creamDim mb-1.5 uppercase tracking-wide";

/** Empty form state for add/edit dialog */
const EMPTY_CAT = { name: "", description: "", imageDataUrl: "" };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/* ══════════════════════════════════════════════════════════════ */
export default function CategoriesPage() {
  const { toggleSidebar } = useAdmin();

  /* ── Data state
   * TODO: Supabase — const { data } = await supabase.from('categories').select('*, products(count)').order('sort_order')
   */
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  useEffect(() => {
    void (async () => {
      const rows = await fetchAdminCategories();
      setCategories(rows.map((row, index) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        image_url: row.image_url,
        sort_order: index + 1,
        product_count: row.product_count,
      })));
    })();
  }, []);

  /* ── Dialog state ────────────────────────────────────────────── */
  type DialogMode = "add" | "edit";
  const [dialog, setDialog] = useState<{ open: boolean; mode: DialogMode; target: AdminCategory | null }>({
    open: false, mode: "add", target: null,
  });
  const [formData, setFormData] = useState(EMPTY_CAT);
  const [saving,   setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  /** Open add dialog */
  function openAdd() {
    setFormData(EMPTY_CAT);
    setDialog({ open: true, mode: "add", target: null });
  }
  /** Open edit dialog pre-filled */
  function openEdit(cat: AdminCategory) {
    setFormData({ name: cat.name, description: cat.description ?? "", imageDataUrl: cat.image_url ?? "" });
    setDialog({ open: true, mode: "edit", target: cat });
  }
  function closeDialog() { setDialog((d) => ({ ...d, open: false })); }

  async function handleImageChange(file: File | null) {
    if (!file) {
      setFormData((f) => ({ ...f, imageDataUrl: "" }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Category image must be under 5 MB.");
      return;
    }
    const dataUrl = await fileToBase64(file);
    setFormData((f) => ({ ...f, imageDataUrl: dataUrl }));
  }

  /* ── Save handler (add or edit)
   * TODO: Supabase
   *   Add:  await supabase.from('categories').insert({ name, slug, description })
   *   Edit: await supabase.from('categories').update({ name, description }).eq('id', target.id)
   */
  async function handleSave() {
    if (!formData.name.trim()) return;
    setSaving(true);
    let ok = false;
    if (dialog.mode === "add") {
      ok = await createAdminCategory({ name: formData.name.trim(), description: formData.description || null, imageDataUrl: formData.imageDataUrl || null });
    } else if (dialog.target) {
      ok = await updateAdminCategory(dialog.target.id, { name: formData.name.trim(), description: formData.description || null, imageDataUrl: formData.imageDataUrl || null });
    }

    if (!ok) {
      setSaving(false);
      alert(getLastAdminDbError() ?? "Could not save category. Check admin role and RLS policies.");
      return;
    }

    const rows = await fetchAdminCategories();
    setCategories(rows.map((row, index) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image_url: row.image_url,
      sort_order: index + 1,
      product_count: row.product_count,
    })));

    setSaving(false);
    closeDialog();
  }

  /* ── Delete handler
   * TODO: Supabase — await supabase.from('categories').delete().eq('id', deleteId)
   */
  async function handleDelete() {
    if (deleteId === null) return;
    await deleteAdminCategory(deleteId);
    const rows = await fetchAdminCategories();
    setCategories(rows.map((row, index) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image_url: row.image_url,
      sort_order: index + 1,
      product_count: row.product_count,
    })));
    setDeleteId(null);
  }

  const totalProducts = useMemo(() => categories.reduce((s, c) => s + c.product_count, 0), [categories]);

  return (
    <div className="min-h-screen">
      <AdminTopbar
        title="Categories"
        subtitle={`${categories.length} categories · ${totalProducts} total products`}
        onMenuClick={toggleSidebar}
        actions={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A028] text-white text-xs font-semibold hover:bg-[#E2B84A] transition shadow"
          >
            <Plus size={14} /> New Category
          </button>
        }
      />

      <div className="p-4 md:p-6">

        {/* ── Category grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-brand-base/40 backdrop-blur-sm rounded-2xl border border-brand-gold/15 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                    <Tag size={18} className="text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-cream font-body">{cat.name}</h3>
                    <p className="text-xs text-brand-creamDim">/{cat.slug}</p>
                  </div>
                </div>
                {/* Actions — visible on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-[#F5EDE4] text-[#7A5A48] hover:text-[#C9A028] transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#7A5A48] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {cat.description && (
                <p className="text-xs text-[#7A5A48] mb-3 leading-relaxed">{cat.description}</p>
              )}

              {cat.image_url && (
                <div className="relative h-24 rounded-xl overflow-hidden border border-brand-gold/15 mb-3">
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                </div>
              )}

              {/* Footer: product count */}
              <div className="flex items-center gap-1.5 text-xs text-brand-creamDim border-t border-brand-gold/10 pt-3 mt-3">
                <Package size={12} />
                <span>{cat.product_count} products</span>
                <span className="ml-auto text-[10px] text-brand-gold/60">sort: {cat.sort_order}</span>
              </div>
            </div>
          ))}

          {/* Add new category card */}
          <button
            onClick={openAdd}
            className="rounded-2xl border-2 border-dashed border-brand-gold/30 p-5 flex flex-col items-center justify-center gap-2 text-brand-gold hover:bg-brand-gold/5 hover:border-brand-gold transition-all duration-200 min-h-[140px]"
          >
            <Plus size={24} />
            <span className="text-sm font-medium">Add Category</span>
          </button>
        </div>

      </div>

      {/* ══ Add / Edit Dialog ════════════════════════════════════ */}
      {dialog.open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeDialog()}
        >
          <div className="bg-brand-base rounded-2xl shadow-xl p-6 max-w-sm w-full border border-brand-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-brand-cream">
                {dialog.mode === "add" ? "Add New Category" : "Edit Category"}
              </h3>
              <button onClick={closeDialog} className="text-brand-creamDim hover:text-brand-cream"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={LABEL}>Name *</label>
                <input
                  type="text"
                  className={INPUT}
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Keychains"
                  autoFocus
                />
              </div>
              <div>
                <label className={LABEL}>Description</label>
                <input
                  type="text"
                  className={INPUT}
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className={LABEL}>Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className={INPUT}
                  onChange={(e) => { void handleImageChange(e.target.files?.[0] ?? null); }}
                />
                {formData.imageDataUrl && (
                  <div className="relative h-24 mt-2 rounded-xl overflow-hidden border border-brand-gold/15">
                    <Image src={formData.imageDataUrl} alt="Category preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button className="flex-1 py-2 rounded-xl border border-[rgba(61,43,31,0.15)] text-sm font-medium hover:bg-[#F5EDE4] transition" onClick={closeDialog}>
                Cancel
              </button>
              <button
                className="flex-1 py-2 rounded-xl bg-[#C9A028] text-white text-sm font-semibold hover:bg-[#E2B84A] disabled:opacity-60 transition flex items-center justify-center gap-2"
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
              >
                <Save size={14} /> {saving ? "Saving…" : dialog.mode === "add" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Confirmation ══════════════════════════════════ */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-display text-lg font-semibold text-[#3D2B1F] mb-2">Delete Category?</h3>
            <p className="text-sm text-[#7A5A48] mb-5">
              Products in this category will not be deleted but will become uncategorized.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border border-[rgba(61,43,31,0.15)] text-sm font-medium hover:bg-[#F5EDE4] transition">Cancel</button>
              <button onClick={() => { void handleDelete(); }} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
