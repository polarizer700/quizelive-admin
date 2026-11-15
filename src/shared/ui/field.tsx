import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@shared/lib/cn";

const control =
  "w-full rounded-xl border-[3px] border-ink bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-stone-400 transition focus:bg-acid/30 focus:shadow-[4px_4px_0_#111]";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-[0.14em] text-stone-600" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, className)} {...props} />;
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 font-mono text-xs font-bold text-pink">{children}</p>;
}
