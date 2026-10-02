"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateQuantity,
  updateUnitPrice,
  removeItem,
  clearCart,
  setDiscountAmount,
  setCustomer,
  setPaymentMethod,
  setCashTendered,
} from "../slices/cartSlice";
import { useCreateOrderMutation } from "@/features/orders/api/orderApi";
import { useGetCustomersQuery } from "@/features/customers/api/customerApi";
import { CustomItemModal } from "./CustomItemModal";
import { EnrollCustomerModal } from "@/features/customers/components/EnrollCustomerModal";
import { SupervisorPinModal } from "@/features/auth/components/SupervisorPinModal";
import { CashSlipModal, type CashSlipData } from "@/features/receipt/components/CashSlipModal";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Pencil,
  PlusCircle,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  UserPlus,
  Sparkles,
  ArrowRight,
  Package,
  Award,
} from "lucide-react";

export function CartSection() {
  const dispatch = useAppDispatch();
  const { items, customer, discountAmount, taxRate, paymentMethod, cashTendered } =
    useAppSelector((state) => state.cart);
  const { user, activeShift } = useAppSelector((state) => state.auth);

  const [createOrder, { isLoading: isCheckingOut }] = useCreateOrderMutation();
  const { data: customersData } = useGetCustomersQuery();

  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [isEnrollCustomerOpen, setIsEnrollCustomerOpen] = useState(false);
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<string>("");

  // Supervisor Authorization Modal State
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [supervisorReason, setSupervisorReason] = useState("");

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<CashSlipData | null>(null);

  // Calculations
  const grossSubtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const subtotalAfterDiscount = Math.max(0, grossSubtotal - discountAmount);
  const totalTax = subtotalAfterDiscount * taxRate;
  const grandTotal = subtotalAfterDiscount + totalTax;
  const changeDue = Math.max(0, (cashTendered || grandTotal) - grandTotal);

  // Supervisor Permission Hierarchy Check
  const requireSupervisorPermission = (reason: string, action: () => void) => {
    // If user is already manager or supervisor, allow directly
    if (user?.role === "branch_manager" || user?.role === "floor_supervisor" || user?.role === "super_admin") {
      action();
      return;
    }

    // Cashier requires authorization PIN
    setSupervisorReason(reason);
    setPendingAction(() => action);
    setIsSupervisorModalOpen(true);
  };

  const handleClearCartClick = () => {
    if (items.length === 0) return;
    requireSupervisorPermission(
      "Void active basket items (" + items.length + " items)",
      () => dispatch(clearCart())
    );
  };

  // Manual Price Override Handlers
  const handleStartEditPrice = (itemId: string, currentPrice: number) => {
    setEditingPriceItemId(itemId);
    setTempPriceValue(String(currentPrice));
  };

  const handleSavePrice = (itemId: string) => {
    const num = parseFloat(tempPriceValue);
    if (!isNaN(num) && num >= 0) {
      dispatch(updateUnitPrice({ id: itemId, unitPrice: num }));
    }
    setEditingPriceItemId(null);
  };

  // Quick Cash Tender Buttons
  const handleQuickCash = (amount: number) => {
    dispatch(setCashTendered(amount));
  };

  const handleAddQuickCash = (delta: number) => {
    dispatch(setCashTendered((cashTendered || grandTotal) + delta));
  };

  // Checkout and Generate Cash Slip
  const handleCheckout = async () => {
    if (items.length === 0) return;

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const slipPayload: CashSlipData = {
      orderNumber,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      cashierName: user?.name || "Terminal Cashier 1",
      terminalId: activeShift?.terminalId || "POS-01",
      customer,
      items,
      subtotal: grossSubtotal,
      taxAmount: totalTax,
      discountAmount,
      totalAmount: grandTotal,
      paymentMethod,
      cashTendered: cashTendered > 0 ? cashTendered : grandTotal,
      changeDue,
    };

    try {
      await createOrder({
        customer_id: customer.id,
        items: items.map((i) => ({
          product_id: i.productId,
          sku: i.sku,
          product_name: i.name,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        })),
        payment_method: paymentMethod,
        discount_amount: discountAmount,
      }).unwrap();
    } catch {
      // offline/demo mode fallback
    }

    setReceiptData(slipPayload);
    setIsReceiptOpen(true);
    dispatch(clearCart());
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
      {/* Cart Header & Customer Selector */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Current Order</h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {items.length} {items.length === 1 ? "line item" : "line items"}
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCartClick}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition"
              title="Void items (Cashiers require Supervisor PIN)"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Customer Selector & Quick CRM Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={customer.id}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                const found = customersData?.data?.find((c) => c.id === id);
                if (found) {
                  dispatch(
                    setCustomer({
                      id: found.id,
                      name: found.name,
                      phone: found.phone,
                      type: found.id === 1 ? "walk_in" : "loyalty",
                      loyaltyPoints: found.loyalty_points || 0,
                    })
                  );
                } else if (id === 2) {
                  dispatch(
                    setCustomer({
                      id: 2,
                      name: "Rafiqul Islam (VIP)",
                      phone: "01812345678",
                      type: "loyalty",
                      loyaltyPoints: 120,
                    })
                  );
                } else {
                  dispatch(
                    setCustomer({
                      id: 1,
                      name: "Walk-in Customer",
                      phone: "01700000000",
                      type: "walk_in",
                      loyaltyPoints: 0,
                    })
                  );
                }
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none w-full cursor-pointer text-xs"
            >
              <option value={1}>Walk-in Customer (Standard)</option>
              <option value={2}>Rafiqul Islam (VIP Member • 120 pts)</option>
              <option value={3}>Farhana Yasmin (Loyalty • 65 pts)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsEnrollCustomerOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
            title="Enroll new loyalty customer"
          >
            <UserPlus className="w-4 h-4 text-indigo-600" />
          </button>

          <button
            type="button"
            onClick={() => setIsCustomItemOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition shrink-0"
            title="Add open price item"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Custom Item</span>
          </button>
        </div>

        {/* Loyalty Customer Points Indicator */}
        {customer.type === "loyalty" && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Loyalty Member ({customer.name})</span>
            </span>
            <span className="font-bold text-amber-700">
              ★ {customer.loyaltyPoints || 0} pts
            </span>
          </div>
        )}
      </div>

      {/* Cart Items Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
        {items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-300 mb-2">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">Shopping Cart is Empty</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Tap items from the left catalog, scan barcodes, or click &quot;+ Custom Item&quot; to enter a manual price.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-2xl hover:bg-slate-50/80 transition flex items-center gap-3"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200/80 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                    {item.name}
                  </h4>
                  <button
                    onClick={() => dispatch(removeItem(item.id))}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Manual Price Override UI */}
                <div className="flex items-center gap-2 mt-1">
                  {editingPriceItemId === item.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-indigo-600">৳</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        autoFocus
                        value={tempPriceValue}
                        onChange={(e) => setTempPriceValue(e.target.value)}
                        onBlur={() => handleSavePrice(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePrice(item.id);
                        }}
                        className="w-20 px-1.5 py-0.5 bg-white border border-indigo-500 rounded text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartEditPrice(item.id, item.unitPrice)}
                      className="group/price flex items-center gap-1 cursor-pointer bg-slate-100/80 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-300 px-1.5 py-0.5 rounded-md transition"
                      title="Click to override product price manually"
                    >
                      <span className="text-[11px] font-bold text-slate-800 group-hover/price:text-indigo-700">
                        ৳{Number(item.unitPrice).toFixed(2)}
                      </span>
                      <Pencil className="w-2.5 h-2.5 text-slate-400 group-hover/price:text-indigo-600" />
                    </div>
                  )}

                  {item.isCustomPrice && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Manual Price
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    /{item.unit}
                  </span>
                </div>

                {/* Quantity Steppers & Line Total */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: Math.max(0, item.quantity - 1),
                          })
                        )
                      }
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: Math.max(1, parseFloat(e.target.value) || 1),
                          })
                        )
                      }
                      className="w-10 text-center text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-900">
                    ৳{(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Financial Calculation & Payment Footer */}
      <div className="p-4 border-t border-slate-200/90 bg-slate-50/50 space-y-3">
        {/* Subtotals breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Gross Subtotal</span>
            <span className="font-semibold text-slate-900">
              ৳{grossSubtotal.toFixed(2)}
            </span>
          </div>

          {/* Discount Input Field (With Supervisor Check for Discounts > ৳100) */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Discount</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">৳</span>
              <input
                type="number"
                min="0"
                value={discountAmount || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (val > 100) {
                    requireSupervisorPermission(
                      `Apply special discount of ৳${val.toFixed(2)}`,
                      () => dispatch(setDiscountAmount(val))
                    );
                  } else {
                    dispatch(setDiscountAmount(val));
                  }
                }}
                placeholder="0.00"
                className="w-16 px-1.5 py-0.5 text-right font-bold text-emerald-700 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>VAT / Tax (5%)</span>
            <span className="font-semibold text-slate-900">
              ৳{totalTax.toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Payable</span>
            <span className="text-xl font-black text-indigo-700">
              ৳{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => dispatch(setPaymentMethod("cash"))}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              paymentMethod === "cash"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch(setPaymentMethod("card"))}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              paymentMethod === "card"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch(setPaymentMethod("mobile_banking"))}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              paymentMethod === "mobile_banking"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>bKash</span>
          </button>
        </div>

        {/* Cash Tender & Change Due Calculator */}
        {paymentMethod === "cash" && items.length > 0 && (
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Cash Received:</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={cashTendered || ""}
                  onChange={(e) =>
                    dispatch(setCashTendered(parseFloat(e.target.value) || 0))
                  }
                  placeholder={grandTotal.toFixed(0)}
                  className="w-24 px-2 py-1 text-right font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Quick Cash Shortcuts */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => handleQuickCash(Math.ceil(grandTotal))}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition shrink-0"
              >
                Exact
              </button>
              <button
                type="button"
                onClick={() => handleAddQuickCash(50)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition shrink-0"
              >
                +৳50
              </button>
              <button
                type="button"
                onClick={() => handleAddQuickCash(100)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition shrink-0"
              >
                +৳100
              </button>
              <button
                type="button"
                onClick={() => handleAddQuickCash(500)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition shrink-0"
              >
                +৳500
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(1000)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition shrink-0"
              >
                ৳1000
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-500">Change Due:</span>
              <span className="font-black text-emerald-600 text-sm">
                ৳{changeDue.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Checkout / Complete Order Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={items.length === 0 || isCheckingOut}
          className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
        >
          <span>Complete Sale & Cash Slip</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Custom Open Item Modal */}
      <CustomItemModal
        isOpen={isCustomItemOpen}
        onClose={() => setIsCustomItemOpen(false)}
      />

      {/* Enroll Customer CRM Modal */}
      <EnrollCustomerModal
        isOpen={isEnrollCustomerOpen}
        onClose={() => setIsEnrollCustomerOpen(false)}
      />

      {/* Supervisor PIN Authorization Modal */}
      <SupervisorPinModal
        isOpen={isSupervisorModalOpen}
        onClose={() => setIsSupervisorModalOpen(false)}
        onAuthorized={() => {
          if (pendingAction) pendingAction();
        }}
        title="Supervisor Authorization"
        reason={supervisorReason}
      />

      {/* Customer Cash Slip Modal */}
      <CashSlipModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={receiptData}
      />
    </div>
  );
}
