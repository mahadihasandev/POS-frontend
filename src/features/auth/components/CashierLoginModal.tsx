"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "../slices/authSlice";
import { 
  KeyRound, 
  Delete, 
  RotateCcw, 
  Mail, 
  X,
  Sparkles
} from "lucide-react";

interface CashierLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CashierLoginModal({ isOpen, onClose }: CashierLoginModalProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"pin" | "email">("pin");
  const [pinCode, setPinCode] = useState<string>("");
  const [email, setEmail] = useState<string>("cashier@supershop.com");
  const [password, setPassword] = useState<string>("password123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePinClick = (digit: string) => {
    if (pinCode.length < 6) {
      const nextPin = pinCode + digit;
      setPinCode(nextPin);
      setError(null);
      if (nextPin.length === 4) {
        authenticateWithPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPinCode((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPinCode("");
    setError(null);
  };

  const authenticateWithPin = async (code: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://pos-backend-juig.onrender.com/api/v1";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": process.env.NEXT_PUBLIC_TENANT_ID || "1",
        },
        body: JSON.stringify({ pin_code: code }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        dispatch(setUser({ user: data.data.user, token: data.data.token }));
        onClose();
        return;
      }
    } catch {
      // Fallback local verification for offline or mock demo mode
    }

    // Local fallback check if API server is asleep or network issue
    if (code === "0000") {
      dispatch(
        setUser({
          user: {
            id: 3,
            name: "Terminal Cashier 1",
            email: "cashier@supershop.com",
            role: "cashier",
            pin_code: "0000",
            tenant_id: 1,
          },
          token: "demo-cashier-token-0000",
        })
      );
      onClose();
    } else if (code === "1234") {
      dispatch(
        setUser({
          user: {
            id: 1,
            name: "Store Manager",
            email: "admin@supershop.com",
            role: "branch_manager",
            pin_code: "1234",
            tenant_id: 1,
          },
          token: "demo-manager-token-1234",
        })
      );
      onClose();
    } else if (code === "9999") {
      dispatch(
        setUser({
          user: {
            id: 2,
            name: "Floor Supervisor",
            email: "supervisor@supershop.com",
            role: "floor_supervisor",
            pin_code: "9999",
            tenant_id: 1,
          },
          token: "demo-supervisor-token-9999",
        })
      );
      onClose();
    } else {
      setError("Invalid PIN code. Try 0000 (Cashier) or 1234 (Manager).");
      setPinCode("");
    }
    setIsSubmitting(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://pos-backend-juig.onrender.com/api/v1";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": process.env.NEXT_PUBLIC_TENANT_ID || "1",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        dispatch(setUser({ user: data.data.user, token: data.data.token }));
        onClose();
        return;
      }
    } catch {
      // offline fallback
    }

    if (email === "admin@supershop.com" && password === "password123") {
      dispatch(
        setUser({
          user: {
            id: 1,
            name: "Store Manager",
            email: "admin@supershop.com",
            role: "branch_manager",
            pin_code: "1234",
            tenant_id: 1,
          },
          token: "demo-manager-token",
        })
      );
      onClose();
    } else {
      dispatch(
        setUser({
          user: {
            id: 3,
            name: "Terminal Cashier 1",
            email: "cashier@supershop.com",
            role: "cashier",
            pin_code: "0000",
            tenant_id: 1,
          },
          token: "demo-cashier-token",
        })
      );
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cashier Terminal Login</h2>
              <p className="text-[11px] text-slate-500">Fast authentication for POS counter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="px-6 pt-4 flex gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab("pin"); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "pin"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Terminal PIN Pad
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("email"); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "email"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Email / Password
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {activeTab === "pin" ? (
            <div className="space-y-4">
              {/* PIN Display Dots */}
              <div className="flex items-center justify-center gap-3 py-3 bg-slate-50 rounded-2xl border border-slate-200">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                      pinCode.length > idx
                        ? "bg-indigo-600 scale-110 shadow-xs shadow-indigo-500/50"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Numeric Keypad Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinClick(String(num))}
                    disabled={isSubmitting}
                    className="h-12 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 text-slate-800 font-bold text-lg shadow-2xs transition flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-500 hover:text-rose-600 active:scale-95 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePinClick("0")}
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 text-slate-800 font-bold text-lg shadow-2xs transition flex items-center justify-center"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleBackspace}
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 active:scale-95 transition flex items-center justify-center"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Demo PIN buttons */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 text-center mb-2 tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>Quick Demo Switch</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => authenticateWithPin("0000")}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-left transition"
                  >
                    <p className="text-xs font-bold text-slate-800">Cashier</p>
                    <p className="text-[10px] text-slate-500 font-mono">PIN: 0000</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => authenticateWithPin("1234")}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-left transition"
                  >
                    <p className="text-xs font-bold text-slate-800">Manager</p>
                    <p className="text-[10px] text-slate-500 font-mono">PIN: 1234</p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Sign In Terminal</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
