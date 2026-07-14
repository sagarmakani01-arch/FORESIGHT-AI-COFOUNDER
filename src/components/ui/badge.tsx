import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 type-label-caps transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-muted text-on-surface-variant border border-border",
        primary:
          "bg-primary-container text-on-primary-container border border-primary/15",
        secondary:
          "bg-surface-container-high text-on-surface-variant border border-border",
        success:
          "bg-primary-container text-on-primary-container border border-primary/15",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200",
        destructive:
          "bg-error-container text-error border border-error/15",
        outline:
          "bg-transparent text-on-surface-variant border border-border-strong",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & BadgeVariants;

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
export type { BadgeProps };
