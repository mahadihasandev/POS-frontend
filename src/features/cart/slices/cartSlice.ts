import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartState, CartItem, CustomerInfo } from "../types";
import type { Product } from "@/features/products/types";

const DEFAULT_CUSTOMER: CustomerInfo = {
  id: 1,
  name: "Walk-in Customer",
  phone: "01700000000",
  type: "walk_in",
  loyaltyPoints: 0,
};

const initialState: CartState = {
  items: [],
  customer: DEFAULT_CUSTOMER,
  discountAmount: 0,
  taxRate: 0.05, // 5% standard supermarket VAT
  paymentMethod: "cash",
  cashTendered: 0,
  parkedCarts: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      const prod = action.payload;
      const existing = state.items.find(
        (item) => item.productId === prod.id && !item.isCustomPrice
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          id: `line-${prod.id}-${Date.now()}`,
          productId: prod.id,
          name: prod.name,
          sku: prod.sku,
          barcode: prod.barcode,
          unitPrice: Number(prod.selling_price),
          originalPrice: Number(prod.selling_price),
          isCustomPrice: false,
          quantity: 1,
          unit: prod.unit || "pcs",
          taxRate: Number(prod.tax_rate ?? 0),
          imageUrl: prod.image_url,
        });
      }
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },

    updateUnitPrice: (
      state,
      action: PayloadAction<{ id: string; unitPrice: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item && action.payload.unitPrice >= 0) {
        item.unitPrice = action.payload.unitPrice;
        item.isCustomPrice = item.unitPrice !== item.originalPrice;
      }
    },

    addCustomItem: (
      state,
      action: PayloadAction<{
        name: string;
        unitPrice: number;
        quantity: number;
        unit: string;
        taxRate?: number;
      }>
    ) => {
      const { name, unitPrice, quantity, unit, taxRate = 0 } = action.payload;
      const randomId = Math.floor(Math.random() * 800000) + 100000;
      state.items.push({
        id: `custom-${Date.now()}-${randomId}`,
        productId: randomId,
        name: name || "Custom Supermarket Item",
        sku: `CUST-${randomId}`,
        barcode: `299000${randomId}`,
        unitPrice: Number(unitPrice),
        originalPrice: Number(unitPrice),
        isCustomPrice: true,
        quantity: Number(quantity) || 1,
        unit: unit || "pcs",
        taxRate: Number(taxRate),
        imageUrl: null,
      });
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    clearCart: (state) => {
      state.items = [];
      state.discountAmount = 0;
      state.cashTendered = 0;
    },

    setDiscountAmount: (state, action: PayloadAction<number>) => {
      state.discountAmount = Math.max(0, action.payload);
    },

    setCustomer: (state, action: PayloadAction<CustomerInfo>) => {
      state.customer = action.payload;
    },

    setPaymentMethod: (
      state,
      action: PayloadAction<"cash" | "card" | "mobile_banking">
    ) => {
      state.paymentMethod = action.payload;
    },

    setCashTendered: (state, action: PayloadAction<number>) => {
      state.cashTendered = Math.max(0, action.payload);
    },

    // Park / Hold Active Basket (F2 shortcut)
    parkCurrentCart: (state) => {
      if (state.items.length === 0) return;

      const subtotal = state.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      state.parkedCarts.push({
        id: `parked-${Date.now()}`,
        parkedAt: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        customer: state.customer,
        items: [...state.items],
        subtotal,
      });

      // Clear active basket for next customer in queue
      state.items = [];
      state.customer = DEFAULT_CUSTOMER;
      state.discountAmount = 0;
      state.cashTendered = 0;
    },

    restoreParkedCart: (state, action: PayloadAction<string>) => {
      const index = state.parkedCarts.findIndex((c) => c.id === action.payload);
      if (index !== -1) {
        const cart = state.parkedCarts[index];
        state.items = cart.items;
        state.customer = cart.customer;
        state.parkedCarts.splice(index, 1);
      }
    },

    deleteParkedCart: (state, action: PayloadAction<string>) => {
      state.parkedCarts = state.parkedCarts.filter((c) => c.id !== action.payload);
    },
  },
});

export const {
  addItem,
  updateQuantity,
  updateUnitPrice,
  addCustomItem,
  removeItem,
  clearCart,
  setDiscountAmount,
  setCustomer,
  setPaymentMethod,
  setCashTendered,
  parkCurrentCart,
  restoreParkedCart,
  deleteParkedCart,
} = cartSlice.actions;

export default cartSlice.reducer;
