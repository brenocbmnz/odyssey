import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-violet-600 hover:bg-violet-500 text-white",
        outline:
          "border border-white/15 bg-white/5 hover:bg-white/10 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
// Padrão composicional de Button do shadcn/ui, adaptado à identidade GameHub.
export function Button({
  asChild = false,
  variant,
  className,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={twMerge(clsx(variants({ variant }), className))}
      {...props}
    />
  );
}
