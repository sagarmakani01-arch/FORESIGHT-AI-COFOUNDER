"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  children: ReactNode;
  className?: string;
}

export default function WidgetCard({
  title,
  description,
  action,
  children,
  className,
}: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "bg-surface thin-border rounded-xl p-6",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="type-label-caps text-on-surface">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-on-surface-variant">{description}</p>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 rounded-lg thin-border bg-surface px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}
