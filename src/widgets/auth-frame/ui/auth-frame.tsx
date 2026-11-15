import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function AuthFrame({ title, children }: { title: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="relative flex flex-col justify-between overflow-hidden border-b-[3px] border-ink bg-ink px-8 py-10 text-paper md:border-b-0 md:border-r-[3px]">
        <p className="relative font-mono text-xs font-bold uppercase tracking-[0.22em] text-acid">QuizeLive</p>
        <div className="relative">
          <h1 className="max-w-md text-5xl font-black uppercase leading-[1.05] tracking-tight">
            Эфир начинается <span className="text-acid">здесь</span>
          </h1>
          <p className="mt-4 max-w-sm font-mono text-sm text-stone-300">
            Викторины, квизы и своя игра — до того, как загорится экран.
          </p>
        </div>
        <p className="relative font-mono text-xs uppercase text-stone-500">Админка студии</p>
      </section>
      <section className="relative flex items-center justify-center overflow-hidden px-6 py-12">
        <motion.div
          className="glass-panel relative w-full max-w-sm rounded-2xl p-6"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-ink">{title}</h2>
          {children}
        </motion.div>
      </section>
    </div>
  );
}
