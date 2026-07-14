"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-surface thin-border shadow-subtle",
        elevated:
          "bg-surface shadow-elevated",
        ghost:
          "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type CardVariants = VariantProps<typeof cardVariants>;

type CardProps = HTMLAttributes<HTMLDivElement> &
  CardVariants & {
    hover?: boolean;
  };

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover = true, children, ...props }, ref) => {
    const motionProps: HTMLMotionProps<"div"> = hover
      ? {
          whileHover: {
            y: -2,
            transition: { duration: 0.2, ease: "easeOut" },
          },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, className }))}
        {...motionProps}
        {...(props as HTMLMotionProps<"div">)}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-8 pb-4", className)}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-headline-md font-semibold leading-none tracking-tight text-on-surface",
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = "CardTitle";

type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-md text-on-surface-variant", className)}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

type CardContentProps = HTMLAttributes<HTMLDivElement>;

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-8 pt-0", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

type CardFooterProps = HTMLAttributes<HTMLDivElement>;

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-8 pt-0", className)}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
export type { CardProps };
