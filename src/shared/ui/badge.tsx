import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";

const tones = {
  draft: "bg-paper text-stone-700",
  published: "bg-mint text-ink",
  admin: "bg-ink text-paper",
  editor: "bg-acid text-ink",
  host: "bg-pink text-ink",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg border-2 border-ink px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
