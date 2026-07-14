"use client";

import { forwardRef } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full thin-border",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-14 w-14",
        xl: "h-20 w-20",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type AvatarVariants = VariantProps<typeof avatarVariants>;

type AvatarProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Root
> &
  AvatarVariants & {
    online?: boolean;
  };

const Avatar = forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, online, children, ...props }, ref) => (
  <div className="relative inline-flex">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size, className }))}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
    {online !== undefined && (
      <span
        className={cn(
          "absolute bottom-0 right-0 block rounded-full ring-2 ring-surface",
          online ? "bg-primary" : "bg-muted-foreground",
          size === "sm" && "h-2 w-2",
          size === "md" && "h-2.5 w-2.5",
          size === "lg" && "h-3 w-3",
          size === "xl" && "h-4 w-4"
        )}
      />
    )}
  </div>
));

Avatar.displayName = "Avatar";

type AvatarImageProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Image
>;

const AvatarImage = forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));

AvatarImage.displayName = "AvatarImage";

type AvatarFallbackProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Fallback
>;

const AvatarFallback = forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-primary text-on-primary font-semibold",
      className
    )}
    {...props}
  />
));

AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
