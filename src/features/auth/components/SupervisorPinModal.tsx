"use client";

import React, { useState } from "react";
import { ShieldAlert, X, KeyRound, Check } from "lucide-react";

interface SupervisorPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorized: () => void;
  title: string;
  reason: string;
}

export function SupervisorPinModal({
  isOpen,
  onClose,
  onAuthorized,
  title,
  reason,
}: SupervisorPinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    // 1. Fast local verification for standard supermarket seeds
    if (pin === "9999" || pin === "1234") {
      setPin("");
      setError(null);
      setIsVerifying(false);
      onAuthorized();
      onClose();
      return;
    }

    // 2. Dynamic API authorization against Supabase database for accounts created from Admin Dashboard
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://pos-backend-juig.onrender.com/api/v1";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": process.env.NEXT_PUBLIC_TENANT_ID || "1",
        },
        body: JSON.stringify({ pin_code: pin }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.user) {
        const role = data.data.user.role;
        if (["floor_supervisor", "branch_manager", "super_admin"].includes(role)) {
          setPin("");
          setError(null);
          setIsVerifying(false);
          onAuthorized();
          onClose();
          return;
        } else {
          setError("Cashier PIN not authorized for supervisor override.");
          setPin("");
          setIsVerifying(false);
          return;
        }
      }
    } catch {
      // offline fallback
    }

    setError("Invalid Supervisor PIN. (Try 9999 or 1234)");
    setPin("");
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-amber-700 font-medium">
                Supervisor Override Required
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
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Action: </span>
            <span>{reason}</span>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enter Floor Supervisor / Manager PIN
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                maxLength={8}
                autoFocus
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center font-mono">
              Demo Override PIN: 9999 (Supervisor) or 1234 (Manager)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isVerifying ? "Verifying PIN..." : "Authorize"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
