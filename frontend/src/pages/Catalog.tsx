import { useMemo, useRef, useState } from "react";
import { useCreate, useList, useRemove, useUpdate } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import type { Product, Vendor } from "../types";

const EMPTY = { name: "", sku: "", unit: "Pcs", default_vendor: "", price: "0" };

export default function Catalog() {
  const toast = useToast();
  const { data: products, isLoading } = useList<Product>("products", "/products/");
  const { data: vendors } = useList<Vendor>("vendors", "/vendors/");
  const createMut = useCreate<Product>("products", "/products/");
  const updateMut = useUpdate<Product>("products", "/products/");
  const removeMut = useRemove("products", "/products/");
  const fileRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ ...p, default_vendor: p.default_vendor || "" }); setModalOpen(true); };

  const save = async () => {
    const payload = { ...form, default_vendor: form.default_vendor || null };
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload });
      toast("Product updated");
    } else {
      await createMut.mutateAsync(payload);
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
      { key: "sku", label: "SKU" },
      { key: "unit", label: "Unit" },
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
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">SKU</label>
            <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Unit</label>
            <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Default Vendor (optional)</label>
            <select className="input" value={form.default_vendor} onChange={(e) => setForm({ ...form, default_vendor: e.target.value })}>
              <option value="">None</option>
              {(vendors || []).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Price</label>
            <input className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}
