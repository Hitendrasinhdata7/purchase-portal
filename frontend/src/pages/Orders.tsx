import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import FilterBar from "../components/FilterBar";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import type { Order, Vendor, User } from "../types";

export default function Orders() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: orders, isLoading } = useList<Order>("orders", "/orders/", filters);
  const { data: vendors } = useList<Vendor>("vendors-lite", "/vendors/");
  const { data: staff } = useList<User>("users-lite", "/users/");

  const columns: Column<Order>[] = useMemo(
    () => [
      { key: "order_number", label: "Order #", sortValue: (o) => o.order_number },
      { key: "creator_name", label: "Creator", render: (o) => o.creator_name || "—", sortValue: (o) => o.creator_name || "" },
      { key: "created_at", label: "Date", render: (o) => new Date(o.created_at).toLocaleDateString(), sortValue: (o) => o.created_at },
      { key: "vendors", label: "Vendors", render: (o) => o.vendors.join(", ") || "—" },
      { key: "items", label: "Items", render: (o) => o.items.length, sortValue: (o) => o.items.length },
      { key: "total_units", label: "Units", sortValue: (o) => o.total_units },
      { key: "status", label: "Status", render: (o) => <Badge status={o.status} />, sortValue: (o) => o.status },
      { key: "updated_at", label: "Last Updated", render: (o) => new Date(o.updated_at).toLocaleString(), sortValue: (o) => o.updated_at },
    ],
    []
  );

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders?.length ?? 0} orders`} />

      <FilterBar
        fields={[
          { key: "status", type: "select", label: "Status", options: [
            { value: "PENDING", label: "Pending" },
            { value: "PARTIAL", label: "Partial" },
            { value: "COLLECTED", label: "Collected" },
            { value: "DELIVERED", label: "Delivered" },
          ]},
          { key: "vendor", type: "select", label: "Vendor", options: (vendors || []).map((v) => ({ value: String(v.id), label: v.name })) },
          { key: "staff", type: "select", label: "Staff", options: (staff || []).map((s) => ({ value: String(s.id), label: s.username })) },
          { key: "date_from", type: "date", label: "From" },
          { key: "date_to", type: "date", label: "To" },
          { key: "search", type: "search", label: "Search" },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        onClear={() => setFilters({})}
      />

      {isLoading ? (
        <div className="card text-center text-slate-400">Loading orders...</div>
      ) : (
        <DataTable
          columns={columns}
          rows={orders || []}
          rowKey={(o) => o.id}
          onRowClick={(o) => navigate(`/orders/${o.id}`)}
          exportFilename="orders"
          emptyLabel="No orders match your filters."
        />
      )}
    </div>
  );
}
