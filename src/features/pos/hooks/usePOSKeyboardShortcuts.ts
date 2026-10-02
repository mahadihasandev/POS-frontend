"use client";

import { useEffect, useCallback } from "react";

export interface POSKeyboardShortcutsOptions {
  onF1Search?: () => void;
  onF2ParkCart?: () => void;
  onF4Checkout?: () => void;
  onF8CustomerLookup?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

/**
 * Enterprise POS Keyboard Shortcut Hook.
 * Maps standard retail POS function keys (F1, F2, F4, F8, Esc)
 * enabling rapid cashier operation without touching the mouse.
 */
export function usePOSKeyboardShortcuts({
  onF1Search,
  onF2ParkCart,
  onF4Checkout,
  onF8CustomerLookup,
  onEscape,
  enabled = true,
}: POSKeyboardShortcutsOptions): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case "F1":
          e.preventDefault();
          onF1Search?.();
          break;
        case "F2":
          e.preventDefault();
          onF2ParkCart?.();
          break;
        case "F4":
          e.preventDefault();
          onF4Checkout?.();
          break;
        case "F8":
          e.preventDefault();
          onF8CustomerLookup?.();
          break;
        case "Escape":
          e.preventDefault();
          onEscape?.();
          break;
        default:
          break;
      }
    },
    [enabled, onF1Search, onF2ParkCart, onF4Checkout, onF8CustomerLookup, onEscape]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}
