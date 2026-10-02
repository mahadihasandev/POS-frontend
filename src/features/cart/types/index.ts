export interface CartItem {
  id: string; // Unique cart line ID
  productId: number;
  name: string;
  sku: string;
  barcode: string;
  unitPrice: number;
  originalPrice: number;
  isCustomPrice: boolean;
  quantity: number;
  unit: string;
  taxRate: number;
  imageUrl?: string | null;
}

export interface CustomerInfo {
  id: number;
  name: string;
  phone: string;
  type: "walk_in" | "loyalty";
  loyaltyPoints?: number;
}

export interface ParkedCart {
  id: string;
  parkedAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  customer: CustomerInfo;
  discountAmount: number;
  taxRate: number;
  paymentMethod: "cash" | "card" | "mobile_banking";
  cashTendered: number;
  parkedCarts: ParkedCart[];
}
