"use client";

import React, { useState, useMemo } from "react";
import { useGetProductsQuery, MOCK_CATEGORIES, MOCK_PRODUCTS } from "../api/productApi";
import { ProductCard } from "./ProductCard";
import type { Product } from "../types";
import { Search, ScanBarcode, PackageSearch, X } from "lucide-react";

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
}

export function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // RTK Query hook
  const { data, isLoading } = useGetProductsQuery(
    selectedCategory !== "all"
      ? { category_id: selectedCategory, search: searchQuery || undefined }
      : searchQuery
      ? { search: searchQuery }
      : undefined
  );

  // Fallback to rich mock data with images if backend response is empty or loading
  const categories = data?.data?.categories?.length
    ? [{ id: 0, name: "All Items", slug: "all" }, ...data.data.categories]
    : MOCK_CATEGORIES;

  const rawProducts = data?.data?.products?.length ? data.data.products : MOCK_PRODUCTS;

  // Filter client-side for ultra-fast instantaneous typing
  const filteredProducts = useMemo(() => {
    return rawProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        selectedCategory === 0 ||
        product.category_id === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        product.name.toLowerCase().includes(q) ||
        product.barcode.includes(q) ||
        product.sku.toLowerCase().includes(q)
      );
    });
  }, [rawProducts, selectedCategory, searchQuery]);

  // Fast Barcode Scanner Enter Key Support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredProducts.length > 0) {
      // If exact barcode match or single result, add directly to cart
      onAddToCart(filteredProducts[0]);
      setSearchQuery("");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Search & Quick Barcode Scanner Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scan barcode or search supermarket products (e.g. Milk, Bananas)..."
          className="w-full pl-10 pr-20 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs transition"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500">
            <ScanBarcode className="w-3 h-3 text-slate-400" />
            <span>POS Scan</span>
          </span>
        </div>
      </div>

      {/* Supermarket Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected =
            cat.slug === "all"
              ? selectedCategory === "all" || selectedCategory === 0
              : selectedCategory === cat.id;

          return (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug === "all" ? "all" : cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading && rawProducts.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5 animate-pulse">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl bg-white border border-slate-200 p-2"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white border border-dashed border-slate-200 rounded-2xl">
            <PackageSearch className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No products found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              No supermarket item matches &quot;{searchQuery}&quot;. You can use the custom item button to add an open-price item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
