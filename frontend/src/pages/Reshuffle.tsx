import { Link } from "react-router-dom";
import { useList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import type { Order } from "../types";

export default function Reshuffle() {
  const { data: orders, isLoading } = useList<Order>("orders", "/orders/");

  const groups: Record<string, { order: Order; item: any }[]> = {};
  (orders || []).forEach((o) => {
    o.items.forEach((item) => {
      if (!item.collected && !item.delivered) {
        const vendor = item.vendor_name || "Unassigned";
        groups[vendor] = groups[vendor] || [];
        groups[vendor].push({ order: o, item });
      }
    });
  });

  const vendorNames = Object.keys(groups).sort();

  return (
    <div>
      <PageHeader title="Reshuffle" subtitle="Items pending collection, grouped by vendor" />
      {isLoading && <div className="card text-center text-slate-400">Loading...</div>}
      {!isLoading && vendorNames.length === 0 && (
        <div className="card text-center text-slate-400">Nothing pending collection right now.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendorNames.map((vendor) => (
          <div key={vendor} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">{vendor}</h3>
              <span className="badge badge-pending">{groups[vendor].length} items</span>
            </div>
            <div className="flex flex-col gap-2">
              {groups[vendor].map(({ order, item }) => (
                <Link
                  key={item.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-100 hover:bg-slate-50"
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{item.product_name}</div>
                    <div className="text-xs text-slate-400">{order.order_number}</div>
                  </div>
                  <span className="text-sm text-slate-600">{item.quantity} {item.unit}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
