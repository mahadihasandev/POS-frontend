"use client";

import React, { useRef } from "react";
import type { CartItem, CustomerInfo } from "@/features/cart/types";
import { Printer, CheckCircle2, X } from "lucide-react";

export interface CashSlipData {
  orderNumber: string;
  date: string;
  cashierName: string;
  terminalId: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  cashTendered: number;
  changeDue: number;
}

interface CashSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CashSlipData | null;
}

export function CashSlipModal({ isOpen, onClose, data }: CashSlipModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold text-slate-800">
              Sale Completed • Customer Cash Slip
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body (Styled as 80mm Supermarket Thermal Paper) */}
        <div className="p-6 overflow-y-auto font-mono text-slate-900 bg-white" id="customer-cash-slip" ref={receiptRef}>
          
          {/* Store Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-base font-black tracking-tight uppercase">
              POS SuperShop Ltd.
            </h2>
            <p className="text-[11px] font-sans font-semibold text-slate-700">
              Dhanmondi Branch #101
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              House #12, Road #4, Dhanmondi, Dhaka-1205
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              Tel: +880 1700-000000 • Mushak-6.3
            </p>
            <p className="text-[10px] text-slate-600 font-bold mt-1">
              BIN / VAT REG: 002394829-0101
            </p>
          </div>

          {/* Metadata */}
          <div className="py-2.5 text-[10px] space-y-0.5 border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Slip No:</span>
              <span className="font-bold">{data.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{data.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span className="font-semibold">{data.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Counter:</span>
              <span>{data.terminalId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold">{data.customer.name}</span>
            </div>
          </div>

          {/* Itemised Table Header */}
          <div className="py-1.5 border-b border-slate-300 text-[10px] font-bold uppercase grid grid-cols-12 gap-1 text-slate-700">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Line Items List */}
          <div className="divide-y divide-dashed divide-slate-200 py-1 text-[11px]">
            {data.items.map((item, idx) => (
              <div key={idx} className="py-1.5 grid grid-cols-12 gap-1 items-start">
                <div className="col-span-6">
                  <p className="font-bold leading-tight line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-[9px] text-slate-500 font-sans">
                    {item.barcode} {item.isCustomPrice && "(Manual Price)"}
                  </p>
                </div>
                <div className="col-span-2 text-center font-bold">
                  {item.quantity}
                </div>
                <div className="col-span-2 text-right text-[10px]">
                  {Number(item.unitPrice).toFixed(2)}
                </div>
                <div className="col-span-2 text-right font-bold">
                  {(item.quantity * item.unitPrice).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal:</span>
              <span>৳{data.subtotal.toFixed(2)}</span>
            </div>
            
            {data.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount Applied:</span>
                <span>-৳{data.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>VAT / Tax (Included):</span>
              <span>৳{data.taxAmount.toFixed(2)}</span>
            </div>

            <div className="border-t border-b-2 border-slate-800 py-1.5 flex justify-between font-black text-sm">
              <span>NET PAYABLE:</span>
              <span>৳{data.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Tender Breakdown */}
          <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
            <div className="flex justify-between uppercase">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold">{data.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid Amount:</span>
              <span className="font-bold">
                ৳{(data.cashTendered || data.totalAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span>Change Returned:</span>
              <span>৳{data.changeDue.toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode Visualization */}
          <div className="pt-3 pb-1 text-center flex flex-col items-center">
            {/* Simulated Barcode Bars */}
            <div className="h-10 w-44 flex items-center justify-between px-1 bg-white">
              {[
                2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2,
                1, 3, 1, 2, 4, 1, 2, 1, 3,
              ].map((w, i) => (
                <div
                  key={i}
                  className="bg-black h-full"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <p className="text-[9px] tracking-widest mt-1 text-slate-600 font-mono">
              *{data.orderNumber}*
            </p>
          </div>

          {/* Footer Policy Notes */}
          <div className="text-center text-[9px] text-slate-500 font-sans space-y-1 mt-2">
            <p className="font-semibold">
              Goods once sold can be exchanged within 7 days with this cash slip.
            </p>
            <p className="text-[8px] text-slate-400">
              Software: POS SuperShop Octane • Powered by Next.js 15
            </p>
            <p className="font-bold text-slate-700">*** THANK YOU & VISIT AGAIN ***</p>
          </div>

        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Cash Slip</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            New Sale
          </button>
        </div>

      </div>
    </div>
  );
}
