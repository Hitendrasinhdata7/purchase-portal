export type Role = "SUPERADMIN" | "STORE_ADMIN" | "STAFF";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  store: number | null;
  store_name: string | null;
  phone: string;
  is_active_staff: boolean;
  date_joined: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface Vendor {
  id: number;
  store: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  notes: string;
  created_at: string;
}

export interface Product {
  id: number;
  store: number;
  name: string;
  brand: string;
  category: string;
  size_weight: string;
  barcode: string;
  sku: string;
  unit: string;
  default_vendor: number | null;
  default_vendor_name: string | null;
  quantity: number;
  price: string;
  image: string | null;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus = "PENDING" | "PARTIAL" | "COLLECTED" | "DELIVERED";

export interface OrderItem {
  id: number;
  order: number;
  product: number | null;
  product_name: string;
  vendor: number | null;
  vendor_name: string | null;
  quantity: string;
  unit: string;
  collected: boolean;
  collected_by: number | null;
  collected_by_name: string | null;
  collected_at: string | null;
  delivered: boolean;
  delivered_by: number | null;
  delivered_by_name: string | null;
  delivered_at: string | null;
  uncollected_reason: string;
  added_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  store: number;
  creator: number | null;
  creator_name: string | null;
  status: OrderStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  vendors: string[];
  total_units: number;
}

export interface ActivityLog {
  id: number;
  actor: number | null;
  actor_name: string | null;
  action: string;
  target_type: string;
  target_label: string;
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardReport {
  total_orders: number;
  pending_orders: number;
  collected_orders: number;
  delivered_orders: number;
  uncollected_items: number;
  active_vendors: number;
}
