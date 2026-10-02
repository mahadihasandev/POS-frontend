"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { apiSlice } from "@/store/api/apiSlice";
import { getSupabaseClient } from "@/lib/supabaseClient";

export interface RealtimeSyncPayload {
  event: "PRICE_UPDATE" | "STOCK_DEPLETED" | "PARKED_CART_SYNC";
  payload: {
    productId?: number;
    newPrice?: number;
    barcode?: string;
    laneId?: string;
  };
}

/**
 * Enterprise Supabase Realtime hook.
 * Subscribes the Next.js POS client to Supabase Realtime broadcast channels
 * for zero-polling instant synchronization of catalog prices, inventory depletion,
 * and parked carts across supermarket lanes.
 */
export function useSupabaseRealtimeSync(tenantId: number = 1): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const supabase = getSupabaseClient();
    const channelName = `store-lane-sync-${tenantId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "broadcast",
        { event: "PRICE_UPDATE" },
        (response: { payload: RealtimeSyncPayload["payload"] }) => {
          // Immediately invalidate local RTK Query product cache
          dispatch(apiSlice.util.invalidateTags(["Products"]));
        }
      )
      .on(
        "broadcast",
        { event: "STOCK_DEPLETED" },
        (response: { payload: RealtimeSyncPayload["payload"] }) => {
          dispatch(apiSlice.util.invalidateTags(["Products"]));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Realtime lane sync active
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dispatch, tenantId]);
}
