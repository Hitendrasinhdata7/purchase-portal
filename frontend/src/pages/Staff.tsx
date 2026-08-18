import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreate, useList, useUpdate } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import type { User } from "../types";

const EMPTY = { username: "", email: "", first_name: "", last_name: "", role: "STAFF", password: "" };

export default function Staff() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: users, isLoading } = useList<User>("users", "/users/");
  const createMut = useCreate<User>("users", "/users/");
  const updateMut = useUpdate<User>("users", "/users/");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);

  const save = async () => {
    await createMut.mutateAsync(form);
    toast("Staff member added");
    setModalOpen(false);
    setForm(EMPTY);
  };

  const toggleActive = async (u: User) => {
    await updateMut.mutateAsync({ id: u.id, payload: { is_active_staff: !u.is_active_staff } });
    toast(u.is_active_staff ? "User deactivated" : "User activated");
  };

  const columns: Column<User>[] = useMemo(
    () => [
      { key: "username", label: "Username", sortValue: (u) => u.username },
      { key: "name", label: "Name", render: (u) => `${u.first_name} ${u.last_name}`.trim() || "—" },
      { key: "role", label: "Role" },
      { key: "store_name", label: "Store", render: (u) => u.store_name || "—" },
      { key: "is_active_staff", label: "Status", render: (u) => (
        <span className={`badge ${u.is_active_staff ? "badge-active" : "badge-inactive"}`}>
          {u.is_active_staff ? "Active" : "Inactive"}
        </span>
      )},
      {
        key: "actions", label: "",
        render: (u) => (
          <button onClick={(e) => { e.stopPropagation(); toggleActive(u); }} className="text-primary text-xs font-semibold">
            {u.is_active_staff ? "Deactivate" : "Activate"}
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle={`${users?.length ?? 0} team members`}
        actions={<button className="btn-primary" onClick={() => setModalOpen(true)}>+ Add Staff</button>}
      />
      {isLoading ? (
        <div className="card text-center text-slate-400">Loading staff...</div>
      ) : (
        <DataTable columns={columns} rows={users || []} rowKey={(u) => u.id} onRowClick={(u) => navigate(`/staff/${u.id}`)} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff Member"
        footer={<>
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save}>Create</button>
        </>}
      >
        <div className="flex flex-col gap-3">
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Username / Email</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value, email: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">First Name</label>
            <input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Last Name</label>
            <input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="STAFF">Staff</option>
              <option value="STORE_ADMIN">Store Admin</option>
            </select></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1">Temporary Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}
