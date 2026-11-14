import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@shared/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        primary:
          "bg-stone-950 text-stone-50 shadow-lg shadow-stone-950/10 hover:-translate-y-0.5 hover:bg-stone-800",
        ghost: "bg-transparent text-stone-700 hover:bg-white/70",
        danger: "bg-red-800 text-white hover:bg-red-900",
        signal:
          "bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:-translate-y-0.5 hover:bg-orange-700",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, tone, type = "button", ...props }: ButtonProps) {
  return <button className={cn(buttonStyles({ tone }), className)} type={type} {...props} />;
}
