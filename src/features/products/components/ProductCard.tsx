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
      className="group relative bg-white border border-slate-200/90 hover:border-indigo-400/80 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden select-none active:scale-[0.98]"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-2.5 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <Package className="w-8 h-8 text-slate-300" />
        )}

        {/* Stock Indicator Badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs border border-slate-200/60">
          {product.stock_quantity > 0 ? (
            <span className="text-emerald-700">
              {Number(product.stock_quantity).toFixed(0)} {product.unit}
            </span>
          ) : (
            <span className="text-rose-600">Out of Stock</span>
          )}
        </div>

        {/* Weight Variable Indicator */}
        {product.is_weight_variable && (
          <div className="absolute top-2 left-2 bg-indigo-600/90 text-white backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
            By Weight
          </div>
        )}
      </div>

      {/* Product Meta Info */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{product.barcode}</span>
          <span className="uppercase font-semibold text-slate-500">{product.unit}</span>
        </div>
      </div>

      {/* Price & Quick Action */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Price</span>
          <span className="text-sm font-bold text-slate-900">
            ৳{Number(product.selling_price).toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            isAddedFeedback
              ? "bg-emerald-600 text-white scale-110 shadow-xs shadow-emerald-500/30"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white"
          }`}
          title="Add to cart"
        >
          {isAddedFeedback ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
