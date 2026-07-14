"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasoningStep {
  label: string;
  status: "pending" | "active" | "completed" | "error";
  detail?: string;
}

interface ReasoningDisplayProps {
  steps: ReasoningStep[];
}

export default function ReasoningDisplay({ steps }: ReasoningDisplayProps) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 overflow-hidden"
    >
      <div className="bg-surface thin-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-on-surface">Reasoning Process</span>
          <span className="text-xs text-on-surface-variant">
            {completedCount}/{steps.length} steps
          </span>
        </div>

        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-3 mt-4">
          <AnimatePresence mode="popLayout">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="relative flex-shrink-0">
                  {step.status === "completed" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                  {step.status === "active" && (
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(16, 185, 129, 0.4)",
                          "0 0 0 8px rgba(16, 185, 129, 0)",
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center"
                    >
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </motion.div>
                  )}
                  {step.status === "pending" && (
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  {step.status === "error" && (
                    <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-error" />
                    </div>
                  )}

                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-8 left-1/2 w-0.5 h-3 -translate-x-1/2",
                        step.status === "completed" ? "bg-primary/30" : "bg-outline-variant"
                      )}
                    />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.status === "completed" && "text-on-surface/70",
                      step.status === "active" && "text-on-surface",
                      step.status === "pending" && "text-muted-foreground",
                      step.status === "error" && "text-error"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.detail && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{step.detail}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
