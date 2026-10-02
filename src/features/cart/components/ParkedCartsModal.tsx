"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { restoreParkedCart, deleteParkedCart } from "../slices/cartSlice";
import { PauseCircle, Play, Trash2, X, Clock, ShoppingCart } from "lucide-react";

interface ParkedCartsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ParkedCartsModal({ isOpen, onClose }: ParkedCartsModalProps) {
  const dispatch = useAppDispatch();
  const { parkedCarts } = useAppSelector((state) => state.cart);

  if (!isOpen) return null;

  const handleRestore = (id: string) => {
    dispatch(restoreParkedCart(id));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Parked / Held Baskets
              </h3>
              <p className="text-[11px] text-slate-500">
                {parkedCarts.length} customer {parkedCarts.length === 1 ? "basket" : "baskets"} on hold (F2)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto divide-y divide-slate-100">
          {parkedCarts.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700">No Parked Baskets</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Press F2 to park the current basket when a customer needs time to retrieve their payment or items.
              </p>
            </div>
          ) : (
            parkedCarts.map((cart) => (
              <div
                key={cart.id}
                className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {cart.customer.name}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {cart.parkedAt}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cart.items.length} items • <span className="font-bold text-slate-900">৳{cart.subtotal.toFixed(2)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRestore(cart.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(deleteParkedCart(cart.id))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                    title="Delete parked basket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
