import { useMemo, useRef, useState } from "react";
import { useCreate, useList, useRemove, useUpdate } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import type { Product, Vendor } from "../types";

const UNITS = ["Pcs", "Litre", "Kg", "Gram", "ml", "Pack", "Box", "Bottle"];

const EMPTY = {
  name: "",
  brand: "",
  category: "",
  size_weight: "",
  barcode: "",
  sku: "",
  default_vendor: "",
  quantity: "0",
  unit: "Pcs",
  notes: "",
};

export default function Catalog() {
  const toast = useToast();
  const { data: products, isLoading } = useList<Product>("products", "/products/");
  const { data: vendors } = useList<Vendor>("vendors", "/vendors/");
  const createMut = useCreate<Product>("products", "/products/");
  const updateMut = useUpdate<Product>("products", "/products/");
  const removeMut = useRemove("products", "/products/");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p, default_vendor: p.default_vendor || "" });
    setImageFile(null);
    setImagePreview(p.image || null);
    setModalOpen(true);
  };

  const pickImage = (file: File | null) => {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : editing?.image || null);
  };

  const save = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.category.trim()) {
      toast("Product Name, Brand and Category are required", "error");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("brand", form.brand);
    fd.append("category", form.category);
    fd.append("size_weight", form.size_weight || "");
    fd.append("barcode", form.barcode || "");
    fd.append("sku", form.sku || "");
    fd.append("unit", form.unit);
    fd.append("quantity", String(form.quantity || 0));
    fd.append("notes", form.notes || "");
    if (form.default_vendor) fd.append("default_vendor", form.default_vendor);
    if (imageFile) fd.append("image", imageFile);

    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload: fd as any });
      toast("Product updated");
    } else {
      await createMut.mutateAsync(fd as any);
      toast("Product created");
    }
    setModalOpen(false);
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    await removeMut.mutateAsync(p.id);
    toast("Product deleted", "error");
  };

  const handleImport = () => {
    toast(`Mock import: parsed ${fileRef.current?.files?.[0]?.name || "file"} — bulk import simulated`);
    if (fileRef.current) fileRef.current.value = "";
  };

  const columns: Column<Product>[] = useMemo(
    () => [
      { key: "name", label: "Name", sortValue: (p) => p.name },
      { key: "brand", label: "Brand", render: (p) => p.brand || "—" },
      { key: "category", label: "Category", render: (p) => p.category || "—" },
      { key: "sku", label: "SKU" },
      { key: "quantity", label: "Qty", render: (p) => `${p.quantity} ${p.unit}` },
      { key: "default_vendor_name", label: "Default Vendor", render: (p) => p.default_vendor_name || "—" },
      { key: "is_active", label: "Active", render: (p) => (p.is_active ? "Yes" : "No") },
      {
        key: "actions",
        label: "",
        render: (p) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(p)} className="text-primary text-xs font-semibold">Edit</button>
            <button onClick={() => remove(p)} className="text-danger text-xs font-semibold">Delete</button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Catalog"
        subtitle={`${products?.length ?? 0} products`}
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <button className="btn-secondary" onClick={() => fileRef.current?.click()}>⬆ Bulk Import CSV</button>
            <button className="btn-primary" onClick={openCreate}>+ Add Product</button>
          </>
        }
      />
      {isLoading ? (
        <div className="card text-center text-slate-400">Loading catalog...</div>
      ) : (
        <DataTable columns={columns} rows={products || []} rowKey={(p) => p.id} exportFilename="catalog" />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Product" : "Add Product"}
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </>}
      >
        <div className="flex flex-col gap-3">
          {!editing && (
            <p className="text-xs text-slate-400 -mt-1">Product not found. Add details manually.</p>
          )}

          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Product Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>

          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Brand *</label>
            <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>

          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Category *</label>
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>

          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Size / Weight</label>
            <input className="input" value={form.size_weight} onChange={(e) => setForm({ ...form, size_weight: e.target.value })} /></div>

          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Barcode</label>
            <input className="input" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></div>

          <div><label className="block text-xs font-semibold text-slate-500 mb-1">SKU</label>
            <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>

          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Vendor</label>
            <select className="input" value={form.default_vendor} onChange={(e) => setForm({ ...form, default_vendor: e.target.value })}>
              <option value="">Not Sure (Default)</option>
              {(vendors || []).map((v) => (
                <option key={v.id} value={v.id}>{v.name}{v.contact_name ? ` · ${v.contact_name}` : ""}</option>
              ))}
            </select></div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Quantity</label>
              <input type="number" min={0} className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Unit</label>
              <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Product Image</label>
            {imagePreview && (
              <img src={imagePreview} alt="Product preview" className="w-24 h-24 object-cover rounded-md border border-slate-200 mb-2" />
            )}
            <div className="flex gap-2">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0] || null)}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0] || null)}
              />
              <button type="button" className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>📷 Camera</button>
              <button type="button" className="btn-secondary" onClick={() => galleryInputRef.current?.click()}>🖼️ Gallery</button>
            </div>
          </div>

          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}
