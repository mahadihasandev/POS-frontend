export interface OrderItem {
  id: number;
  product_id: number;
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: number;
  uuid: string;
  tenant_id: number;
  order_number: string;
  status: {
    value: "pending" | "paid" | "processing" | "completed" | "cancelled" | "refunded";
    label: string;
  };
  financials: {
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
  };
  payment_method: string;
  metadata?: Record<string, unknown>;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  tenant_id: number;
  date: string;
  total_orders: number;
  gross_revenue: number;
  average_order_value: number;
  completed_orders: number;
  pending_orders: number;
  generated_at: string;
}

export interface CreateOrderPayload {
  customer_id?: number | null;
  payment_method: "cash" | "card" | "mobile_banking" | "credit";
  discount_amount?: number;
  tax_rate?: number;
  items: Array<{
    product_id: number;
    sku: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}
