import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "success" | "warning" | "destructive";
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = "default",
  icon,
}: MetricCardProps) {
  return (
    <Card className="hover:border-slate-700 transition duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">{title}</p>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold tracking-tight text-white">{value}</h4>
          {badgeText && (
            <Badge variant={badgeVariant} className="text-[10px]">
              {badgeText}
            </Badge>
          )}
        </div>

        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
