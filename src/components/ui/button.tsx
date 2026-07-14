"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  isValidElement,
  cloneElement,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary hover:bg-primary-dark shadow-subtle",
        secondary:
          "bg-transparent border border-border text-foreground hover:bg-muted",
        ghost:
          "bg-transparent text-on-surface-variant hover:bg-muted hover:text-foreground",
        destructive:
          "bg-error text-on-error hover:bg-error/90",
        outline:
          "bg-transparent border border-primary text-primary hover:bg-primary/5",
        glow:
          "bg-primary text-white shadow-emerald-glow hover:bg-primary-dark",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    loading?: boolean;
    asChild?: boolean;
    children?: ReactNode;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, asChild, children, disabled, ...props },
    ref
  ) => {
    const motionProps: HTMLMotionProps<"button"> = {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.97 },
      transition: { type: "spring", stiffness: 400, damping: 20 },
    };

    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<Record<string, unknown>>, {
        className: cn(classes, (children.props as { className?: string }).className),
        ref,
        ...motionProps,
      });
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...motionProps}
        {...(props as HTMLMotionProps<"button">)}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
