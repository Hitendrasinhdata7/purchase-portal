import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDetail } from "../hooks/useApi";
import { api } from "../services/api";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import type { Order, OrderItem } from "../types";

const STEPS = [
  { key: "PENDING", label: "Ordered" },
  { key: "COLLECTED", label: "Collected" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const { data: order, isLoading } = useDetail<Order>("orders", "/orders/", id);

  const [uncollectItem, setUncollectItem] = useState<OrderItem | null>(null);
  const [reason, setReason] = useState("");
  const [editItem, setEditItem] = useState<OrderItem | null>(null);
  const [editQty, setEditQty] = useState("");
  const [removeItem, setRemoveItem] = useState<OrderItem | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["orders"] });

  const collect = async (item: OrderItem) => {
    await api.post(`/order-items/${item.id}/collect/`);
    toast(`${item.product_name} marked collected`);
    refresh();
  };

  const deliver = async (item: OrderItem) => {
    await api.post(`/order-items/${item.id}/deliver/`);
    toast(`${item.product_name} marked delivered`);
    refresh();
  };

  const confirmUncollect = async () => {
    if (!uncollectItem) return;
    await api.post(`/order-items/${uncollectItem.id}/uncollect/`, { reason });
    toast(`${uncollectItem.product_name} uncollected`, "error");
    setUncollectItem(null);
    setReason("");
    refresh();
  };

  const saveEdit = async () => {
    if (!editItem) return;
    await api.patch(`/order-items/${editItem.id}/`, { quantity: editQty });
    toast(`${editItem.product_name} updated`);
    setEditItem(null);
    refresh();
  };

  const confirmRemove = async () => {
    if (!removeItem) return;
    await api.delete(`/order-items/${removeItem.id}/`);
    toast(`${removeItem.product_name} removed`, "error");
    setRemoveItem(null);
    refresh();
  };

  if (isLoading || !order) return <div className="card text-center text-slate-400">Loading order...</div>;

  const stepIndex = STEPS.findIndex((s) => s.key === order.status) >= 0
    ? STEPS.findIndex((s) => s.key === order.status)
    : order.status === "PARTIAL" ? 1 : 0;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-primary mb-3">← Back</button>
      <PageHeader
        title={order.order_number}
        subtitle={`Created by ${order.creator_name || "—"} on ${new Date(order.created_at).toLocaleString()}`}
        actions={<Badge status={order.status} />}
      />

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <div className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= stepIndex ? "bg-primary" : "bg-slate-200"}`} />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                  i <= stepIndex ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs font-semibold text-slate-600 mt-2">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.product_name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.vendor_name || "—"}</td>
                  <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3">
                    {item.delivered ? <Badge status="DELIVERED" /> : item.collected ? <Badge status="COLLECTED" /> : <Badge status="PENDING" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {!item.collected && (
                        <button onClick={() => collect(item)} className="btn-primary !px-3 !py-1.5 text-xs">Mark Collected</button>
                      )}
                      {item.collected && !item.delivered && (
                        <button onClick={() => deliver(item)} className="btn-primary !px-3 !py-1.5 text-xs bg-success hover:bg-green-600">Mark Delivered</button>
                      )}
                      {item.collected && (
                        <button onClick={() => setUncollectItem(item)} className="btn-secondary !px-3 !py-1.5 text-xs">Uncollect</button>
                      )}
                      <button
                        onClick={() => { setEditItem(item); setEditQty(item.quantity); }}
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                      >
                        Edit
                      </button>
                      <button onClick={() => setRemoveItem(item)} className="text-danger text-xs font-semibold px-2">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!uncollectItem} onClose={() => setUncollectItem(null)} title="Uncollect item"
        footer={<>
          <button className="btn-secondary" onClick={() => setUncollectItem(null)}>Cancel</button>
          <button className="btn-danger" onClick={confirmUncollect}>Uncollect</button>
        </>}>
        <p className="text-sm text-slate-600 mb-3">Why is <strong>{uncollectItem?.product_name}</strong> being uncollected?</p>
        <textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason..." />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit item"
        footer={<>
          <button className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
          <button className="btn-primary" onClick={saveEdit}>Save</button>
        </>}>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity</label>
        <input className="input" value={editQty} onChange={(e) => setEditQty(e.target.value)} />
      </Modal>

      <Modal open={!!removeItem} onClose={() => setRemoveItem(null)} title="Remove item"
        footer={<>
          <button className="btn-secondary" onClick={() => setRemoveItem(null)}>Cancel</button>
          <button className="btn-danger" onClick={confirmRemove}>Remove</button>
        </>}>
        <p className="text-sm text-slate-600">Remove <strong>{removeItem?.product_name}</strong> from this order? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
