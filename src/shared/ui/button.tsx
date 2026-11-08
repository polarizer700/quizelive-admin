import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@shared/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        primary: "bg-stone-950 text-stone-50 hover:bg-stone-800",
        ghost: "bg-transparent text-stone-700 hover:bg-stone-200/80",
        danger: "bg-red-800 text-white hover:bg-red-900",
        signal: "bg-orange-700 text-white hover:bg-orange-800",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, tone, type = "button", ...props }: ButtonProps) {
  return <button className={cn(buttonStyles({ tone }), className)} type={type} {...props} />;
}
