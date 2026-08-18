import { useParams, useNavigate } from "react-router-dom";
import { useDetail, useList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import type { User, Order, ActivityLog } from "../types";

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading } = useDetail<User>("users", "/users/", id);
  const { data: orders } = useList<Order>("orders", "/orders/");
  const { data: activity } = useList<ActivityLog>("activity", "/activity/", { actor: id });

  if (isLoading || !user) return <div className="card text-center text-slate-400">Loading...</div>;

  const created = (orders || []).filter((o) => o.creator === user.id);
  let collected = 0, delivered = 0;
  (orders || []).forEach((o) => o.items.forEach((i) => {
    if (i.collected_by === user.id) collected++;
    if (i.delivered_by === user.id) delivered++;
  }));

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-primary mb-3">← Back</button>
      <PageHeader title={`${user.first_name} ${user.last_name}`.trim() || user.username} subtitle={user.role} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card"><div className="text-2xl font-extrabold">{created.length}</div><div className="text-xs text-slate-500 font-medium">Orders Created</div></div>
        <div className="card"><div className="text-2xl font-extrabold">{collected}</div><div className="text-xs text-slate-500 font-medium">Items Collected</div></div>
        <div className="card"><div className="text-2xl font-extrabold">{delivered}</div><div className="text-xs text-slate-500 font-medium">Items Delivered</div></div>
        <div className="card"><div className="text-2xl font-extrabold">{user.is_active_staff ? "Active" : "Inactive"}</div><div className="text-xs text-slate-500 font-medium">Status</div></div>
      </div>

      <div className="card">
        <h3 className="font-bold text-slate-900 mb-3">Recent Activity</h3>
        <div className="flex flex-col gap-2">
          {(activity || []).slice(0, 10).map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm px-3 py-2 border border-slate-100 rounded-md">
              <span><strong>{a.action}</strong> {a.target_type}: {a.target_label}</span>
              <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
            </div>
          ))}
          {(activity || []).length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
        </div>
      </div>
    </div>
  );
}
