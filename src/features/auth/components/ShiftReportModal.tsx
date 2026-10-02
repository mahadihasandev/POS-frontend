"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeShift } from "../slices/authSlice";
import { ReceiptText, CheckCircle, AlertTriangle, X, Printer, Lock } from "lucide-react";

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftReportModal({ isOpen, onClose }: ShiftReportModalProps) {
  const dispatch = useAppDispatch();
  const { user, activeShift } = useAppSelector((state) => state.auth);

  const [reportType, setReportType] = useState<"x_report" | "z_report">("x_report");
  const [countedCash, setCountedCash] = useState<string>("");
  const [isFinalized, setIsFinalized] = useState(false);

  if (!isOpen) return null;

  // Theoretical shift financial metrics (computed from active register)
  const openingFloat = activeShift?.startingCash || 5000;
  const cashSales = 12450;
  const cardSales = 8200;
  const mfsSales = 3450;
  const cashDrops = 5000; // Drop to safe
  const expectedCashInDrawer = openingFloat + cashSales - cashDrops;

  const countedNum = parseFloat(countedCash) || 0;
  const discrepancy = countedNum - expectedCashInDrawer;

  const handleCloseShift = () => {
    setIsFinalized(true);
    setTimeout(() => {
      dispatch(closeShift());
      onClose();
      setIsFinalized(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Shift Register Audit & Settlement
              </h3>
              <p className="text-[11px] text-slate-500">
                Terminal {activeShift?.terminalId || "POS-01"} • {user?.name}
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

        {/* Tab Toggle: X-Report (Interim) vs Z-Report (Final Close) */}
        <div className="px-6 pt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setReportType("x_report")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              reportType === "x_report"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            X-Report (Interim Reading)
          </button>
          <button
            type="button"
            onClick={() => setReportType("z_report")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              reportType === "z_report"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Z-Report (End-of-Shift Close)
          </button>
        </div>

        {/* Report Body */}
        <div className="p-6 space-y-4 font-mono text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Shift Opened:</span>
              <span className="font-bold text-slate-800">
                {activeShift?.openedAt ? new Date(activeShift.openedAt).toLocaleTimeString() : "08:00 AM"}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Opening Cash Float:</span>
              <span className="font-bold text-slate-800">৳{openingFloat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Gross Cash Sales:</span>
              <span className="font-bold text-emerald-700">+৳{cashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Card / Digital Sales:</span>
              <span className="font-bold text-slate-800">৳{(cardSales + mfsSales).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Cash Drops to Safe:</span>
              <span className="font-bold text-rose-600">-৳{cashDrops.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900 text-sm">
              <span>Expected Cash in Drawer:</span>
              <span>৳{expectedCashInDrawer.toFixed(2)}</span>
            </div>
          </div>

          {reportType === "z_report" && (
            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physical Cash Counted in Register (৳)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  autoFocus
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  placeholder="Enter physical cash count..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              {countedCash && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between font-bold ${
                    discrepancy === 0
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : discrepancy > 0
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {discrepancy === 0 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {discrepancy === 0
                        ? "Balanced (Zero Discrepancy)"
                        : discrepancy > 0
                        ? `Cash Over (+৳${discrepancy.toFixed(2)})`
                        : `Cash Short (-৳${Math.abs(discrepancy).toFixed(2)})`}
                    </span>
                  </span>
                  <span>Count: ৳{countedNum.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2 font-sans">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Reading</span>
            </button>

            {reportType === "z_report" ? (
              <button
                type="button"
                onClick={handleCloseShift}
                disabled={!countedCash || isFinalized}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isFinalized ? "Closing Shift..." : "Finalize & Close Shift"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition"
              >
                Resume POS Counter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
