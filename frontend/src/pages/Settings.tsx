import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ first_name: user?.first_name || "", last_name: user?.last_name || "", phone: user?.phone || "" });
  const [toggles, setToggles] = useState({ emailNotifications: true, darkMode: false, autoRefresh: true });

  const save = async () => {
    if (!user) return;
    const { data } = await api.patch(`/users/${user.id}/`, form);
    setUser(data);
    toast("Profile updated");
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile and preferences" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Profile</h3>
          <div className="flex flex-col gap-3">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">First Name</label>
              <input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Last Name</label>
              <input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <button className="btn-primary mt-2 self-start" onClick={save}>Save Changes</button>
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Preferences</h3>
          <div className="flex flex-col gap-4">
            {Object.entries(toggles).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                <button
                  onClick={() => setToggles((t) => ({ ...t, [key]: !(t as any)[key] }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${val ? "bg-primary" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${val ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
