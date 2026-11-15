import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      className="flex flex-wrap items-end justify-between gap-4"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cobalt">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-black uppercase leading-none tracking-tight text-ink md:text-4xl">
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{description}</p> : null}
      </div>
      {action}
    </motion.header>
  );
}
