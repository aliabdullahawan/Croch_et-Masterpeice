/* ════════════════════════════════════════════════════════════════
   app/admin/products/page.tsx  —  Products List
   ──────────────────────────────────────────────────────────────
   Features:
   - Searchable + filterable product table (category, status, price)
   - Add / Edit / Delete actions per row
   - Bulk-select checkboxes
   - Product count and inventory summary
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useMemo, useEffect }  from "react";
import AdminTopbar             from "@/components/admin/AdminTopbar";
import { useAdmin }            from "@/context/AdminContext";
import { fetchAdminProducts, fetchAdminCategories, deleteAdminProduct, getLastAdminDbError } from "@/lib/db-client";
import type { AdminProduct }   from "@/lib/admin-types";
import {
  Search, Plus, Edit2, Trash2, Filter,
  CheckSquare, Square, Star, Package,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════ */
export default function ProductsPage() {
  const { toggleSidebar } = useAdmin();

  /* ── Local state ────────────────────────────────────────────── */
  const [search,         setSearch]      = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [statusFilter,   setStatusFilter]   = useState<"all" | "available" | "unavailable">("all");
  const [selected,       setSelected]    = useState<Set<string>>(new Set());
  const [deleteId,       setDeleteId]    = useState<string | null>(null);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; product_count: number }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [productRows, categoryRows] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories(),
      ]);
      setProducts(productRows);
      setCategories(categoryRows);
      setLoadError(getLastAdminDbError());
    })();
  }, []);

  function formatPKR(amount: number): string {
    return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
  }

  /* ── Filtered product list ─────────────────────────────────── */
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch   = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category_id === categoryFilter;
      const matchStatus   = statusFilter === "all" || (statusFilter === "available" ? p.is_available : !p.is_available);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  /* ── Bulk select helpers ─────────────────────────────────────── */
  function toggleSelect(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAll() {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id)));
  }

  /* ── Mock delete handler
   * TODO: Supabase — await supabase.from('products').delete().eq('id', deleteId)
   */
  async function handleDelete(id: string) {
    await deleteAdminProduct(id);
    const productRows = await fetchAdminProducts();
    setProducts(productRows);
    setDeleteId(null);
  }

  /* ── Margin calculation ──────────────────────────────────────── */
  function getMargin(p: AdminProduct): string {
    if (!p.price || !p.cost) return "—";
    return `${Math.round(((p.price - p.cost) / p.price) * 100)}%`;
  }

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <AdminTopbar
        title="Products"
        subtitle={`${products.length} total products`}
        onMenuClick={toggleSidebar}
        actions={
          <a
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A028] text-white text-xs font-semibold hover:bg-[#E2B84A] transition-colors shadow"
          >
            <Plus size={14} /> Add Product
          </a>
        }
      />

      <div className="p-4 md:p-6 space-y-4">

        {loadError && (
          <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {loadError}
          </div>
        )}

        {/* ── Filters row ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5A48]" />
            <input
              type="text"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-brand-cream/15 bg-brand-base/50 text-sm font-body text-brand-cream w-full outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-brand-cream/15 bg-brand-base/50 text-sm font-body text-brand-cream outline-none focus:border-brand-gold transition"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 rounded-xl border border-brand-cream/15 bg-brand-base/50 text-sm font-body text-brand-cream outline-none focus:border-brand-gold transition"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* Bulk actions bar — appears only when items are selected */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm">
            <span className="text-amber-700 font-medium">{selected.size} selected</span>
            <button className="ml-auto text-red-600 hover:text-red-800 flex items-center gap-1 text-xs font-medium">
              <Trash2 size={13} /> Delete selected
            </button>
          </div>
        )}

        {/* ── Products table ──────────────────────────────────── */}
        <div className="bg-brand-base/40 backdrop-blur-sm rounded-2xl border border-brand-gold/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-brand-gold/10 text-brand-creamDim font-medium text-xs border-b border-brand-gold/15">
                  <th className="px-4 py-3 text-left w-10">
                    {/* Select-all checkbox */}
                    <button onClick={toggleAll} className="text-brand-creamDim hover:text-brand-gold">
                      {selected.size === filtered.length && filtered.length > 0
                        ? <CheckSquare size={16} />
                        : <Square size={16} />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Margin</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(61,43,31,0.05)]">
                {filtered.map((product) => {
                  const cat    = categories.find((c) => c.id === product.category_id);
                  const isSelected = selected.has(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-brand-gold/5 transition-colors ${isSelected ? "bg-brand-gold/10" : "border-b border-brand-gold/5"}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(product.id)} className="text-brand-creamDim hover:text-brand-gold">
                          {isSelected ? <CheckSquare size={15} className="text-brand-gold" /> : <Square size={15} />}
                        </button>
                      </td>

                      {/* Name + featured badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                            <Package size={14} className="text-brand-gold" />
                          </div>
                          <div>
                            <div className="font-medium text-brand-cream flex items-center gap-1">
                              {product.name}
                              {product.is_featured && <Star size={11} className="text-brand-gold fill-current" />}
                            </div>
                            {product.is_custom && <div className="text-[10px] text-teal-600">Custom order</div>}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 text-[#7A5A48] font-mono text-xs">{product.sku ?? "—"}</td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        {cat ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#F5EDE4] text-[#7A5A48] text-[11px]">
                            {cat.name}
                          </span>
                        ) : "—"}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right font-semibold text-[#3D2B1F]">
                        {product.price ? formatPKR(product.price) : "—"}
                      </td>

                      {/* Cost */}
                      <td className="px-4 py-3 text-right text-[#7A5A48]">
                        {product.cost ? formatPKR(product.cost) : "—"}
                      </td>

                      {/* Margin */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-green-600 font-medium text-xs">{getMargin(product)}</span>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${product.stock_qty === 0 ? "text-red-500" : product.stock_qty <= 3 ? "text-amber-500" : "text-[#3D2B1F]"}`}>
                          {product.stock_qty}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${product.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {product.is_available ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-[#F5EDE4] text-[#7A5A48] hover:text-[#C9A028] transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </a>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#7A5A48] hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty state */}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center text-[#7A5A48]">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      <div className="text-sm">No products match your filters.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer: result count */}
          <div className="px-6 py-3 border-t border-[rgba(61,43,31,0.06)] text-xs text-[#7A5A48] font-body">
            Showing {filtered.length} of {products.length} products
          </div>
        </div>

        {/* ── Delete confirmation modal ─────────────────────── */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <h3 className="font-display text-lg font-semibold text-[#3D2B1F] mb-2">Delete Product?</h3>
              <p className="text-sm text-[#7A5A48] mb-5">This action cannot be undone. The product will be permanently removed.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2 rounded-xl border border-[rgba(61,43,31,0.15)] text-sm font-medium text-[#3D2B1F] hover:bg-[#F5EDE4] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
