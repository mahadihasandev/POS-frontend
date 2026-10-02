import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardStats } from "@/features/orders/components/DashboardStats";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        title="POS SuperShop Overview"
        description="Dual-tier client connected to Laravel 13 Octane & FrankenPHP runtime."
      />

      {/* Modular Section Component with RTK Query */}
      <section aria-labelledby="live-metrics">
        <h2 id="live-metrics" className="sr-only">Live Retail Metrics</h2>
        <DashboardStats />
      </section>
    </div>
  );
}
