import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/cn";

export function Panel({
  title,
  action,
  children,
  className,
  delay = 0,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={cn("glass-panel rounded-2xl p-5", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-ink">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </motion.section>
  );
}
