"use client";

import React from "react";
import { useGetDashboardMetricsQuery } from "../api/orderApi";
import { MetricCard } from "@/components/shared/MetricCard";

export function DashboardStats() {
  const { data, isLoading, isError, refetch } = useGetDashboardMetricsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white border border-slate-200"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center justify-between">
        <span>Offline or connecting to backend live sales feed...</span>
        <button
          onClick={() => refetch()}
          className="text-xs font-bold underline hover:text-rose-900"
        >
          Retry Feed
        </button>
      </div>
    );
  }

  const metrics = data?.data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Gross Sales (Today)"
        value={`৳${(metrics?.gross_revenue ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`}
        subtitle="Redis cached • 5m TTL"
        badgeText="Live"
        badgeVariant="success"
      />

      <MetricCard
        title="Total Orders"
        value={(metrics?.total_orders ?? 0).toLocaleString()}
        subtitle="Across branch POS checkouts"
        badgeText="Throughput"
        badgeVariant="default"
      />

      <MetricCard
        title="Average Order Value"
        value={`৳${(metrics?.average_order_value ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`}
        subtitle="Per transaction basket"
      />

      <MetricCard
        title="Completed Orders"
        value={(metrics?.completed_orders ?? 0).toLocaleString()}
        subtitle={`${metrics?.pending_orders ?? 0} orders pending fulfillment`}
        badgeText={metrics?.pending_orders ? "Pending Queue" : "Clear"}
        badgeVariant={metrics?.pending_orders ? "warning" : "success"}
      />
    </div>
  );
}
