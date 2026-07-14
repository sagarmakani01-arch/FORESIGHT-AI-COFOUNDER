"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md bg-surface-container-low thin-border text-on-surface text-body-md placeholder:text-muted-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-11 px-4 py-2.5",
        ghost:
          "h-11 bg-transparent border-transparent focus-visible:border-primary",
      },
      inputSize: {
        sm: "h-9 px-3 py-2 text-sm",
        md: "h-11 px-4 py-2.5",
        lg: "h-13 px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

type InputVariants = VariantProps<typeof inputVariants>;

type InputProps = InputHTMLAttributes<HTMLInputElement> &
  InputVariants & {
    error?: string;
    label?: string;
    helperText?: string;
    icon?: ReactNode;
    iconRight?: ReactNode;
  };

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type,
      error,
      label,
      helperText,
      icon,
      iconRight,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="type-label-caps text-on-surface-variant block"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 flex items-center text-muted-foreground pointer-events-none">
              {icon}
            </span>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant, inputSize }),
              icon && "pl-10",
              iconRight && "pr-10",
              error &&
                "border-error focus-visible:ring-error/30 focus-visible:border-error",
              className
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 flex items-center text-muted-foreground">
              {iconRight}
            </span>
          )}
        </div>
        {(helperText || error) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-error" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
