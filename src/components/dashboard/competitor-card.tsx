"use client";

import { motion } from "framer-motion";
import { Eye, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Competitor {
  name: string;
  status: "watching" | "threat" | "opportunity";
  lastUpdated: string;
  description?: string;
}

interface CompetitorCardProps {
  competitor: Competitor;
  className?: string;
}

const statusConfig = {
  watching: {
    icon: Eye,
    label: "Watching",
    dotColor: "bg-primary",
    textColor: "text-primary",
    bgColor: "bg-primary-container",
  },
  threat: {
    icon: AlertTriangle,
    label: "Threat",
    dotColor: "bg-error",
    textColor: "text-error",
    bgColor: "bg-error-container",
  },
  opportunity: {
    icon: TrendingUp,
    label: "Opportunity",
    dotColor: "bg-success",
    textColor: "text-success",
    bgColor: "bg-primary-container",
  },
};

export default function CompetitorCard({ competitor, className }: CompetitorCardProps) {
  const config = statusConfig[competitor.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={cn(
        "flex items-center gap-3 rounded-lg thin-border px-4 py-3 transition-colors hover:bg-surface-container-low",
        className
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", config.dotColor)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface truncate">
            {competitor.name}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              config.bgColor,
              config.textColor
            )}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {config.label}
          </span>
        </div>
        {competitor.description && (
          <p className="mt-0.5 text-xs text-on-surface-variant truncate">
            {competitor.description}
          </p>
        )}
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Updated {competitor.lastUpdated}
        </p>
      </div>

      <button className="shrink-0 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
