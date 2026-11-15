import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";
import { Sparkline } from "./sparkline";

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
  delay = 0,
  sparkline,
  change,
  changePositive,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
  delay?: number;
  sparkline?: number[];
  change?: string;
  changePositive?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className={cn("glass-card relative overflow-hidden rounded-2xl p-5", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{label}</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-ink">{value}</p>
          {change ? (
            <p
              className={cn(
                "mt-2 font-mono text-xs font-bold uppercase",
                changePositive === false ? "text-pink" : "text-emerald-600",
              )}
            >
              {change}
            </p>
          ) : null}
          {hint ? <p className="mt-2 text-sm text-stone-500">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="grid size-11 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-acid text-ink shadow-[3px_3px_0_#111]">
            {icon}
          </div>
        ) : null}
      </div>
      {sparkline && sparkline.length > 1 ? (
        <div className="relative mt-4 h-12">
          <Sparkline values={sparkline} />
        </div>
      ) : null}
    </motion.article>
  );
}
