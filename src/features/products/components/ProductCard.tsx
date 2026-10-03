"use client";

import React, { useState } from "react";
import type { Product } from "../types";
import { Plus, Package, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  const handleClick = () => {
    onAddToCart(product);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 500);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      className="group relative bg-white border border-slate-200/90 hover:border-indigo-500/80 rounded-xl p-2 shadow-2xs hover:shadow-sm transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden select-none active:scale-[0.98]"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-1.5 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <Package className="w-6 h-6 text-slate-300" />
        )}

        {/* Stock Indicator Badge */}
        <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-700 shadow-2xs border border-slate-200/60 leading-none">
          {product.stock_quantity > 0 ? (
            <span className="text-emerald-700">
              {Number(product.stock_quantity).toFixed(0)} {product.unit}
            </span>
          ) : (
            <span className="text-rose-600">0</span>
          )}
        </div>

        {/* Weight Variable Indicator */}
        {product.is_weight_variable && (
          <div className="absolute top-1 left-1 bg-indigo-600/90 text-white backdrop-blur-xs px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider leading-none">
            Wt
          </div>
        )}
      </div>

      {/* Product Meta Info */}
      <div className="space-y-0.5">
        <h3
          className="text-[11px] sm:text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug"
          title={product.name}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono leading-none">
          <span className="truncate max-w-[70px]">{product.barcode}</span>
          <span className="uppercase text-[9px] font-semibold text-slate-500">{product.unit}</span>
        </div>
      </div>

      {/* Price & Quick Action */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
        <div className="min-w-0">
          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
            ৳{Number(product.selling_price).toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all ${
            isAddedFeedback
              ? "bg-emerald-600 text-white scale-110 shadow-xs shadow-emerald-500/30"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white"
          }`}
          title="Add to cart"
        >
          {isAddedFeedback ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
