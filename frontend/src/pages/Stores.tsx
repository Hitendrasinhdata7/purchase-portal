import { useMemo, useState } from "react";
import { useCreate, useList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import type { Store, User } from "../types";

const EMPTY = {
  name: "",
  address: "",
  phone: "",
  admin_username: "",
  admin_email: "",
  admin_password: "",
};

export default function Stores() {
  const toast = useToast();
  const { data: stores, isLoading } = useList<Store>("stores", "/stores/");
  const createStoreMut = useCreate<Store>("stores", "/stores/");
  const createUserMut = useCreate<User>("users", "/users/");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const save = async () => {
    if (!form.name.trim()) {
      toast("Store name is required", "error");
      return;
    }
    if (!form.admin_username.trim() || !form.admin_password.trim()) {
      toast("Store Admin username and password are required", "error");
      return;
    }
    setSaving(true);
    try {
      // Step 1: create the store
      const store = await createStoreMut.mutateAsync({
        name: form.name,
        address: form.address,
        phone: form.phone,
      });

      // Step 2: create its Store Admin, linked to the new store
      await createUserMut.mutateAsync({
        username: form.admin_username,
        email: form.admin_email || form.admin_username,
        first_name: "",
        last_name: "",
        role: "STORE_ADMIN",
        store: store.id,
        password: form.admin_password,
      } as any);

      toast(`Store "${store.name}" and its admin were created`);
      setModalOpen(false);
      setForm(EMPTY);
    } catch (err: any) {
      toast(err?.response?.data?.detail || "Failed to create store/admin", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Store>[] = useMemo(
    () => [
      { key: "name", label: "Name", sortValue: (s) => s.name },
      { key: "address", label: "Address", render: (s) => s.address || "—" },
      { key: "phone", label: "Phone", render: (s) => s.phone || "—" },
      { key: "is_active", label: "Active", render: (s) => (s.is_active ? "Yes" : "No") },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Stores"
        subtitle={`${stores?.length ?? 0} stores`}
        actions={<button className="btn-primary" onClick={() => setModalOpen(true)}>+ Add Store</button>}
      />
      {isLoading ? (
        <div className="card text-center text-slate-400">Loading stores...</div>
      ) : (
        <DataTable columns={columns} rows={stores || []} rowKey={(s) => s.id} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Store"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? "Creating..." : "Create Store & Admin"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Store Details</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Store Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Address (optional)</label>
                <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phone (optional)</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Store Admin (main login for this store)</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Username / Email</label>
                <input
                  className="input"
                  value={form.admin_username}
                  onChange={(e) => setForm({ ...form, admin_username: e.target.value, admin_email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Temporary Password</label>
                <input
                  className="input"
                  type="password"
                  value={form.admin_password}
                  onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
