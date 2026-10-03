"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, parkCurrentCart } from "@/features/cart/slices/cartSlice";
import { useGetProductsQuery, MOCK_PRODUCTS } from "@/features/products/api/productApi";
import { CashierHeader } from "@/features/auth/components/CashierHeader";
import { CashierLoginModal } from "@/features/auth/components/CashierLoginModal";
import { ShiftReportModal } from "@/features/auth/components/ShiftReportModal";
import { ParkedCartsModal } from "@/features/cart/components/ParkedCartsModal";
import { ProductCatalog } from "@/features/products/components/ProductCatalog";
import { CartSection } from "@/features/cart/components/CartSection";
import { DashboardStats } from "@/features/orders/components/DashboardStats";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import { usePOSKeyboardShortcuts } from "../hooks/usePOSKeyboardShortcuts";
import { useSupabaseRealtimeSync } from "../hooks/useSupabaseRealtimeSync";
import type { Product } from "@/features/products/types";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  PauseCircle,
  ReceiptText,
  Keyboard,
  Radio,
  MessageSquare,
} from "lucide-react";

export function POSTerminal() {
  const dispatch = useAppDispatch();
  const { items, parkedCarts } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isShiftReportOpen, setIsShiftReportOpen] = useState(false);
  const [isParkedModalOpen, setIsParkedModalOpen] = useState(false);
  const [showLiveStats, setShowLiveStats] = useState(false);

  // 1. Supabase Realtime Channel Subscription
  useSupabaseRealtimeSync(1);

  // 2. Fetch products for instant scanner barcode lookup
  const { data: productsData } = useGetProductsQuery();
  const catalog = productsData?.data?.products?.length
    ? productsData.data.products
    : MOCK_PRODUCTS;

  const handleAddToCart = (product: Product) => {
    dispatch(addItem(product));
  };

  // 3. Hardware USB / Bluetooth HID Barcode Scanner Integration
  useBarcodeScanner({
    onScan: (barcode) => {
      // Find matching item in catalog
      const matched = catalog.find(
        (p) => p.barcode === barcode || p.sku.toLowerCase() === barcode.toLowerCase()
      );

      if (matched) {
        dispatch(addItem(matched));
      } else {
        // Fast dynamic uncataloged scanned product entry
        dispatch(
          addItem({
            id: Math.floor(Math.random() * 800000) + 100000,
            tenant_id: 1,
            category_id: null,
            name: `Scanned Item #${barcode.slice(-4)}`,
            sku: `SCAN-${barcode.slice(-6)}`,
            barcode,
            cost_price: 50.0,
            selling_price: 75.0,
            stock_quantity: 99.0,
            unit: "pcs",
            is_weight_variable: false,
            tax_rate: 0.05,
            image_url: null,
            is_active: true,
          })
        );
      }
    },
    maxIntervalMs: 40,
    minLength: 3,
  });

  // 4. Keyboard-First Retail Mappings (F1, F2, F4, F8, Esc)
  usePOSKeyboardShortcuts({
    onF1Search: () => {
      const searchInput = document.querySelector<HTMLInputElement>(
        'input[placeholder*="Scan barcode"]'
      );
      searchInput?.focus();
    },
    onF2ParkCart: () => {
      if (items.length > 0) {
        dispatch(parkCurrentCart());
      } else {
        setIsParkedModalOpen(true);
      }
    },
    onF4Checkout: () => {
      const checkoutBtn = document.querySelector<HTMLButtonElement>(
        'button:has(svg:has(path[d*="M4 4h"]))'
      );
      checkoutBtn?.scrollIntoView({ behavior: "smooth" });
    },
    onF8CustomerLookup: () => {
      const customerSelect = document.querySelector<HTMLSelectElement>("select");
      customerSelect?.focus();
    },
    onEscape: () => {
      setIsLoginModalOpen(false);
      setIsShiftReportOpen(false);
      setIsParkedModalOpen(false);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Cashier Top Navigation Bar */}
      <CashierHeader onOpenLoginModal={() => setIsLoginModalOpen(true)} />

      {/* POS Quick Ribbon: Shortcuts, Parked Carts, Realtime status */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Supabase Realtime Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Supabase Realtime Sync Active</span>
          </div>

          {/* Parked Carts Status & Button (F2) */}
          <button
            type="button"
            onClick={() => setIsParkedModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
              parkedCarts.length > 0
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>
              [F2] Parked Baskets: <strong>{parkedCarts.length}</strong>
            </span>
          </button>

          {/* Shift Report (X-Report / Z-Report) */}
          <button
            type="button"
            onClick={() => setIsShiftReportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
          >
            <ReceiptText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Shift X/Z-Report</span>
          </button>

          {/* WhatsApp CRM Support Desk */}
          <a
            href="https://wa.me/8801735696417"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200 transition"
            title="Chat with Store CRM Desk on WhatsApp (+8801735696417)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp CRM (+8801735696417)</span>
          </a>
        </div>

        {/* Keyboard Function Keys Bar */}
        <div className="hidden xl:flex items-center gap-2 font-mono text-[10px] text-slate-500">
          <Keyboard className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700">F1 Search</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700">F2 Hold Cart</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700">F4 Tender</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700">F8 CRM</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-700">Esc Close</span>
        </div>
      </div>

      {/* Collapsible Live Metrics Bar */}
      <div className="px-4 sm:px-6 pt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowLiveStats(!showLiveStats)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Store Live Throughput & Metrics</span>
            {showLiveStats ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showLiveStats && (
          <div className="mt-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs animate-in fade-in duration-200">
            <DashboardStats />
          </div>
        )}
      </div>

      {/* Main POS Counter Viewport: 60% Catalog / 40% Current Order Split */}
      <main className="flex-1 p-4 sm:px-6 pb-6 grid grid-cols-1 lg:grid-cols-pos gap-5 min-h-0">
        {/* Left: Product Catalog (Categories + Images + Search) - 60% */}
        <section
          aria-label="Product Catalog"
          className="flex flex-col min-h-[500px] min-w-0"
        >
          <ProductCatalog onAddToCart={handleAddToCart} />
        </section>

        {/* Right: Active Basket / Current Order / Split Payment / Tender / Cash Slip - 40% */}
        <section
          aria-label="Active Checkout Basket"
          className="flex flex-col min-w-0"
        >
          <CartSection />
        </section>
      </main>

      {/* Modals & Terminal Lock Screen */}
      <CashierLoginModal
        isOpen={isLoginModalOpen || !isAuthenticated || !user}
        isLockScreen={!isAuthenticated || !user}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <ParkedCartsModal
        isOpen={isParkedModalOpen}
        onClose={() => setIsParkedModalOpen(false)}
      />

      <ShiftReportModal
        isOpen={isShiftReportOpen}
        onClose={() => setIsShiftReportOpen(false)}
      />
    </div>
  );
}
