import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreate, useList, useRemove, useUpdate } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import type { Vendor } from "../types";

const EMPTY = { name: "", contact_name: "", phone: "", email: "", status: "ACTIVE" as const };

export default function Vendors() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: vendors, isLoading } = useList<Vendor>("vendors", "/vendors/");
  const createMut = useCreate<Vendor>("vendors", "/vendors/");
  const updateMut = useUpdate<Vendor>("vendors", "/vendors/");
  const removeMut = useRemove("vendors", "/vendors/");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<any>(EMPTY);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (v: Vendor) => { setEditing(v); setForm(v); setModalOpen(true); };

  const save = async () => {
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload: form });
      toast("Vendor updated");
    } else {
      await createMut.mutateAsync(form);
      toast("Vendor created");
    }
    setModalOpen(false);
  };

  const remove = async (v: Vendor) => {
    if (!confirm(`Delete vendor "${v.name}"?`)) return;
    await removeMut.mutateAsync(v.id);
    toast("Vendor deleted", "error");
  };

  const columns: Column<Vendor>[] = useMemo(
    () => [
      { key: "name", label: "Name", sortValue: (v) => v.name },
      { key: "contact_name", label: "Contact", sortValue: (v) => v.contact_name },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status", render: (v) => <Badge status={v.status} />, sortValue: (v) => v.status },
      {
        key: "actions",
        label: "",
        render: (v) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => openEdit(v)} className="text-primary text-xs font-semibold">Edit</button>
            <button onClick={() => remove(v)} className="text-danger text-xs font-semibold">Delete</button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle={`${vendors?.length ?? 0} vendors`}
        actions={<button className="btn-primary" onClick={openCreate}>+ Add Vendor</button>}
      />
      {isLoading ? (
        <div className="card text-center text-slate-400">Loading vendors...</div>
      ) : (
        <DataTable
          columns={columns}
          rows={vendors || []}
          rowKey={(v) => v.id}
          onRowClick={(v) => navigate(`/vendors/${v.id}`)}
          exportFilename="vendors"
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Vendor" : "Add Vendor"}
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </>}
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Name</label>
            <input className="input" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
