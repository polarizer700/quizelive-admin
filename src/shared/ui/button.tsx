import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@shared/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl border-[3px] border-ink px-4 py-2.5 text-sm font-bold transition duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        primary:
          "bg-ink text-paper shadow-[4px_4px_0_rgba(17,17,17,0.35)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-cobalt hover:shadow-[6px_6px_0_rgba(17,17,17,0.35)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_rgba(17,17,17,0.35)]",
        ghost:
          "bg-paper text-ink shadow-[3px_3px_0_#111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-acid hover:shadow-[5px_5px_0_#111] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#111]",
        danger:
          "bg-pink text-ink shadow-[4px_4px_0_#111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#111]",
        signal:
          "bg-acid text-ink shadow-[4px_4px_0_#111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#111]",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, tone, type = "button", ...props }: ButtonProps) {
  return <button className={cn(buttonStyles({ tone }), className)} type={type} {...props} />;
}
