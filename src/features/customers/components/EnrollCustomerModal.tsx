"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setCustomer } from "@/features/cart/slices/cartSlice";
import { useEnrollCustomerMutation } from "../api/customerApi";
import { UserPlus, X } from "lucide-react";

interface EnrollCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollCustomerModal({ isOpen, onClose }: EnrollCustomerModalProps) {
  const dispatch = useAppDispatch();
  const [enrollCustomer, { isLoading }] = useEnrollCustomerMutation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      const res = await enrollCustomer({ name, phone, email }).unwrap();
      if (res.data) {
        dispatch(
          setCustomer({
            id: res.data.id,
            name: res.data.name,
            phone: res.data.phone,
            type: "loyalty",
            loyaltyPoints: res.data.loyalty_points || 0,
          })
        );
      }
    } catch {
      // Fallback local registration
      const newId = Math.floor(Math.random() * 90000) + 1000;
      dispatch(
        setCustomer({
          id: newId,
          name: name.trim(),
          phone: phone.trim(),
          type: "loyalty",
          loyaltyPoints: 10,
        })
      );
    }

    setName("");
    setPhone("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Enroll New Customer
              </h3>
              <p className="text-[11px] text-slate-500">
                Add to loyalty program & counter ledger
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Farhana Yasmin"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Phone
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition"
            >
              Enroll & Attach
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
