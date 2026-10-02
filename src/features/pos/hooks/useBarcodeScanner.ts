"use client";

import { useEffect, useRef, useCallback } from "react";

export interface UseBarcodeScannerOptions {
  /**
   * Callback invoked when a complete barcode is successfully decoded.
   */
  onScan: (barcode: string) => void;
  /**
   * Maximum latency threshold in milliseconds between consecutive keystrokes.
   * Hardware scanners emit keystrokes rapidly (typically 5ms to 25ms),
   * while human keystrokes typically exceed 80ms to 200ms.
   * @default 40
   */
  maxIntervalMs?: number;
  /**
   * Minimum length for a scanned barcode string (e.g., EAN-8 is 8, UPC-A is 12, EAN-13 is 13).
   * @default 3
   */
  minLength?: number;
  /**
   * List of key codes that signal barcode completion (usually 'Enter').
   * @default ['Enter']
   */
  endKeys?: string[];
  /**
   * Whether the scanner listener is currently active.
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether to stop event propagation and prevent default behavior when barcode completion is detected.
   * @default true
   */
  preventDefaultOnScan?: boolean;
}

/**
 * Production-grade React hook for enterprise supermarket POS terminals.
 * Listens globally for high-speed USB / Bluetooth HID barcode scanners,
 * gracefully handles focus loss, filters out human typing, and dispatches scanned barcodes.
 */
export function useBarcodeScanner({
  onScan,
  maxIntervalMs = 40,
  minLength = 3,
  endKeys = ["Enter"],
  enabled = true,
  preventDefaultOnScan = true,
}: UseBarcodeScannerOptions): void {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const onScanRef = useRef(onScan);

  // Keep latest callback reference without triggering re-subscriptions
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const currentTime = performance.now();
      const interval = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      const target = event.target as HTMLElement | null;
      const isInputFocused =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      // Handle barcode completion terminator (e.g. Enter)
      if (endKeys.includes(event.key)) {
        const bufferedText = bufferRef.current.trim();

        // Check if accumulated buffer meets length and timing constraints of a scanner burst
        if (bufferedText.length >= minLength) {
          if (preventDefaultOnScan) {
            event.preventDefault();
            event.stopPropagation();
          }

          // If focused inside an input and it wasn't a dedicated manual field, clear it
          if (isInputFocused && target instanceof HTMLInputElement) {
            // Avoid contaminating manual search fields with raw scanner buffer
            if (target.getAttribute("data-scanner-bypass") !== "true") {
              target.value = "";
            }
          }

          onScanRef.current(bufferedText);
          bufferRef.current = "";
          return;
        }

        // If buffer was too short or slow, treat as standard Enter and clear buffer
        bufferRef.current = "";
        return;
      }

      // Ignore modifier keys, functional keys, and non-printable characters
      if (
        event.key.length > 1 ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      ) {
        return;
      }

      // Inter-character timing evaluation:
      // If keystrokes arrive with interval > maxIntervalMs, human typing is detected.
      // Flush previous buffer and restart fresh.
      if (interval > maxIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      // Append valid character to accumulator
      bufferRef.current += event.key;
    },
    [enabled, endKeys, maxIntervalMs, minLength, preventDefaultOnScan]
  );

  useEffect(() => {
    if (!enabled) return;

    // Attach high-priority capture listener on window
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [enabled, handleKeyDown]);
}
