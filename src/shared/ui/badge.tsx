import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";

const tones = {
  draft: "bg-stone-200/80 text-stone-700 backdrop-blur",
  published: "bg-emerald-100/90 text-emerald-800 backdrop-blur",
  admin: "bg-stone-900 text-stone-50",
  editor: "bg-orange-100/90 text-orange-900 backdrop-blur",
  host: "bg-sky-100/90 text-sky-900 backdrop-blur",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}
