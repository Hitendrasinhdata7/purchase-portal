import { useParams, useNavigate, Link } from "react-router-dom";
import { useDetail, useList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import type { Vendor, Order, Product } from "../types";

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useDetail<Vendor>("vendors", "/vendors/", id);
  const { data: orders } = useList<Order>("orders", "/orders/");
  const { data: products } = useList<Product>("products", "/products/");

  if (isLoading || !vendor) return <div className="card text-center text-slate-400">Loading vendor...</div>;

  const linkedOrders = (orders || []).filter((o) => o.items.some((i) => i.vendor_name === vendor.name));
  const linkedProducts = (products || []).filter((p) => p.default_vendor === vendor.id);

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-primary mb-3">← Back</button>
      <PageHeader title={vendor.name} subtitle={vendor.contact_name || "No contact set"} actions={<Badge status={vendor.status} />} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card"><div className="text-xs text-slate-400 font-semibold mb-1">Phone</div><div className="font-semibold text-slate-800">{vendor.phone || "—"}</div></div>
        <div className="card"><div className="text-xs text-slate-400 font-semibold mb-1">Email</div><div className="font-semibold text-slate-800">{vendor.email || "—"}</div></div>
        <div className="card"><div className="text-xs text-slate-400 font-semibold mb-1">Linked Orders</div><div className="font-semibold text-slate-800">{linkedOrders.length}</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-3">Linked Orders</h3>
          <div className="flex flex-col gap-2">
            {linkedOrders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-100 hover:bg-slate-50">
                <span className="font-semibold text-sm">{o.order_number}</span>
                <Badge status={o.status} />
              </Link>
            ))}
            {linkedOrders.length === 0 && <p className="text-sm text-slate-400">No orders yet.</p>}
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-3">Products</h3>
          <div className="flex flex-col gap-2">
            {linkedProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-100">
                <span className="font-semibold text-sm">{p.name}</span>
                <span className="text-sm text-slate-500">${p.price}</span>
              </div>
            ))}
            {linkedProducts.length === 0 && <p className="text-sm text-slate-400">No products assigned.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
