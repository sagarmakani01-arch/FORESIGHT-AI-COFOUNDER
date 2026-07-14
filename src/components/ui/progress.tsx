"use client";

import { forwardRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  indicatorClassName?: string;
  label?: string;
};

const Progress = forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, label, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    {label && (
      <div className="flex items-center justify-between">
        <span className="type-label-caps text-on-surface-variant">{label}</span>
        <span className="type-label-caps text-on-surface-variant">
          {Math.round(value || 0)}%
        </span>
      </div>
    )}
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-surface-container-high",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500 ease-out",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  </div>
));

Progress.displayName = "Progress";

export { Progress };
