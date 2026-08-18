import { useQuery } from "@tanstack/react-query";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { api } from "../services/api";
import { useList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import KPIcard from "../components/KPIcard";
import ChartBox from "../components/ChartBox";
import Badge from "../components/Badge";
import { Link } from "react-router-dom";
import type { DashboardReport, Order } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { data: kpis } = useQuery({
    queryKey: ["dashboard-report"],
    queryFn: async () => (await api.get<DashboardReport>("/reports/dashboard/")).data,
  });

  const { data: volume } = useQuery({
    queryKey: ["volume-report"],
    queryFn: async () => (await api.get("/reports/volume/", { params: { days: 14 } })).data as { day: string; count: number }[],
  });

  const { data: orders } = useList<Order>("orders-attention", "/orders/");

  const pendingOld = (orders || []).filter((o) => {
    const hrs = (Date.now() - new Date(o.created_at).getTime()) / 36e5;
    return o.status === "PENDING" && hrs > 48;
  });
  const uncollectedOrders = (orders || []).filter((o) => o.items.some((i) => !i.collected && !i.delivered));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your store's purchase activity" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KPIcard label="Total Orders" value={kpis?.total_orders ?? "—"} icon="🧾" tone="primary" />
        <KPIcard label="Pending" value={kpis?.pending_orders ?? "—"} icon="⏳" tone="warning" />
        <KPIcard label="Collected" value={kpis?.collected_orders ?? "—"} icon="✅" tone="primary" />
        <KPIcard label="Delivered" value={kpis?.delivered_orders ?? "—"} icon="🚚" tone="success" />
        <KPIcard label="Uncollected Items" value={kpis?.uncollected_items ?? "—"} icon="⚠️" tone="danger" />
        <KPIcard label="Active Vendors" value={kpis?.active_vendors ?? "—"} icon="🏬" tone="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartBox title="Order Volume (last 14 days)">
          <Line
            data={{
              labels: (volume || []).map((v) => v.day),
              datasets: [
                {
                  label: "Orders",
                  data: (volume || []).map((v) => v.count),
                  borderColor: "#6C5CE7",
                  backgroundColor: "rgba(108,92,231,0.1)",
                  fill: true,
                  tension: 0.35,
                },
              ],
            }}
            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
          />
        </ChartBox>
        <ChartBox title="Orders by Status">
          <Doughnut
            data={{
              labels: ["Pending", "Collected", "Delivered"],
              datasets: [
                {
                  data: [kpis?.pending_orders ?? 0, kpis?.collected_orders ?? 0, kpis?.delivered_orders ?? 0],
                  backgroundColor: ["#F59E0B", "#6C5CE7", "#22C55E"],
                },
              ],
            }}
            options={{ maintainAspectRatio: false }}
          />
        </ChartBox>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-3">Pending &gt; 48h ({pendingOld.length})</h3>
          <div className="flex flex-col gap-2">
            {pendingOld.slice(0, 6).map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 border border-slate-100">
                <span className="font-semibold text-sm text-slate-700">{o.order_number}</span>
                <Badge status={o.status} />
              </Link>
            ))}
            {pendingOld.length === 0 && <p className="text-sm text-slate-400">Nothing overdue. Nice work!</p>}
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-3">Orders with Uncollected Items ({uncollectedOrders.length})</h3>
          <div className="flex flex-col gap-2">
            {uncollectedOrders.slice(0, 6).map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 border border-slate-100">
                <span className="font-semibold text-sm text-slate-700">{o.order_number}</span>
                <Badge status={o.status} />
              </Link>
            ))}
            {uncollectedOrders.length === 0 && <p className="text-sm text-slate-400">All items collected.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
