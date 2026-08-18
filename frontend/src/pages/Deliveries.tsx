import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useList } from "../hooks/useApi";
import { api } from "../services/api";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import type { Order } from "../types";

export default function Deliveries() {
  const { data: orders, isLoading } = useList<Order>("orders", "/orders/");
  const qc = useQueryClient();
  const toast = useToast();

  const pending: { order: Order; item: any }[] = [];
  (orders || []).forEach((o) => {
    o.items.forEach((item) => {
      if (item.collected && !item.delivered) pending.push({ order: o, item });
    });
  });

  const deliver = async (itemId: number, name: string) => {
    await api.post(`/order-items/${itemId}/deliver/`);
    toast(`${name} marked delivered`);
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  return (
    <div>
      <PageHeader title="Deliveries" subtitle={`${pending.length} items ready to deliver`} />
      {isLoading && <div className="card text-center text-slate-400">Loading...</div>}
      {!isLoading && pending.length === 0 && (
        <div className="card text-center text-slate-400">No collected items awaiting delivery.</div>
      )}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Collected By</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pending.map(({ order, item }) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.product_name}</td>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order.id}`} className="text-primary font-semibold">{order.order_number}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.vendor_name || "—"}</td>
                  <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-slate-500">{item.collected_by_name || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deliver(item.id, item.product_name)} className="btn-primary !px-3 !py-1.5 text-xs bg-success hover:bg-green-600">
                      Deliver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
