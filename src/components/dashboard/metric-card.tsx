"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export default function MetricCard({
  icon,
  label,
  value,
  change,
  trend = "neutral",
  className,
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-primary"
      : trend === "down"
        ? "text-error"
        : "text-on-surface-variant";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "bg-surface thin-border rounded-xl p-5 transition-colors hover:border-[rgba(0,0,0,0.15)]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container">
          <span className="text-primary">{icon}</span>
        </div>
        {change !== undefined && change !== 0 && (
          <div className={cn("flex items-center gap-1 text-xs font-semibold", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="type-label-caps text-on-surface-variant">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-on-surface">{value}</p>
      </div>
    </motion.div>
  );
}
