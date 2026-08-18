import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { api } from "../services/api";
import PageHeader from "../components/PageHeader";
import FilterBar from "../components/FilterBar";
import ChartBox from "../components/ChartBox";
import DataTable, { Column } from "../components/DataTable";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

interface VendorPerf { vendor__id: number; vendor__name: string; units_ordered: number; units_collected: number; }
interface StaffPerf { user_id: number; username: string; collected: number; delivered: number; }
interface Uncollected { id: number; order_number: string; product_name: string; vendor: string | null; quantity: string; unit: string; created_at: string; }

export default function Reports() {
  const [range, setRange] = useState<Record<string, string>>({});

  const { data: volume } = useQuery({
    queryKey: ["report-volume", range],
    queryFn: async () => (await api.get("/reports/volume/", { params: { days: 30 } })).data as { day: string; count: number }[],
  });
  const { data: vendorPerf } = useQuery({
    queryKey: ["report-vendor"],
    queryFn: async () => (await api.get<VendorPerf[]>("/reports/vendor-performance/")).data,
  });
  const { data: staffPerf } = useQuery({
    queryKey: ["report-staff"],
    queryFn: async () => (await api.get<StaffPerf[]>("/reports/staff-performance/")).data,
  });
  const { data: uncollected } = useQuery({
    queryKey: ["report-uncollected"],
    queryFn: async () => (await api.get<Uncollected[]>("/reports/uncollected/")).data,
  });

  const uncollectedCols: Column<Uncollected>[] = [
    { key: "order_number", label: "Order #", sortValue: (r) => r.order_number },
    { key: "product_name", label: "Product", sortValue: (r) => r.product_name },
    { key: "vendor", label: "Vendor", render: (r) => r.vendor || "—" },
    { key: "quantity", label: "Qty", render: (r) => `${r.quantity} ${r.unit}` },
    { key: "created_at", label: "Added", render: (r) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Performance and volume analytics" />

      <FilterBar
        fields={[
          { key: "date_from", type: "date", label: "From" },
          { key: "date_to", type: "date", label: "To" },
        ]}
        values={range}
        onChange={(k, v) => setRange((r) => ({ ...r, [k]: v }))}
        onClear={() => setRange({})}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartBox title="Order Volume (30 days)">
          <Line
            data={{ labels: (volume || []).map((v) => v.day), datasets: [{ label: "Orders", data: (volume || []).map((v) => v.count), borderColor: "#6C5CE7", backgroundColor: "rgba(108,92,231,0.1)", fill: true, tension: 0.35 }] }}
            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
          />
        </ChartBox>
        <ChartBox title="Vendor Performance">
          <Bar
            data={{
              labels: (vendorPerf || []).map((v) => v.vendor__name),
              datasets: [
                { label: "Ordered", data: (vendorPerf || []).map((v) => v.units_ordered), backgroundColor: "#8B5CF6" },
                { label: "Collected", data: (vendorPerf || []).map((v) => v.units_collected || 0), backgroundColor: "#22C55E" },
              ],
            }}
            options={{ maintainAspectRatio: false }}
          />
        </ChartBox>
      </div>

      <ChartBox title="Staff Performance">
        <Bar
          data={{
            labels: (staffPerf || []).map((s) => s.username),
            datasets: [
              { label: "Collected", data: (staffPerf || []).map((s) => s.collected), backgroundColor: "#6C5CE7" },
              { label: "Delivered", data: (staffPerf || []).map((s) => s.delivered), backgroundColor: "#22C55E" },
            ],
          }}
          options={{ maintainAspectRatio: false }}
        />
      </ChartBox>

      <div className="mt-6">
        <h3 className="font-bold text-slate-900 mb-3">Uncollected Items</h3>
        <DataTable columns={uncollectedCols} rows={uncollected || []} rowKey={(r) => r.id} exportFilename="uncollected-items" />
      </div>
    </div>
  );
}
