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
      className={cn("glass-card relative overflow-hidden rounded-[1.4rem] p-5", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.1),transparent_55%)]" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">{value}</p>
          {change ? (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                changePositive === false ? "text-rose-600" : "text-emerald-600",
              )}
            >
              {change}
            </p>
          ) : null}
          {hint ? <p className="mt-2 text-sm text-stone-500">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-700">
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
