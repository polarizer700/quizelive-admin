import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function AuthFrame({ title, children }: { title: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="relative flex flex-col justify-between overflow-hidden bg-stone-950 px-8 py-10 text-stone-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.4),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_40%)]" />
        <p className="relative text-xs uppercase tracking-[0.22em] text-orange-300">QuizeLive</p>
        <div className="relative">
          <h1 className="max-w-md font-serif text-5xl italic leading-tight">Эфир начинается здесь</h1>
          <p className="mt-4 max-w-sm text-stone-300">
            Викторины, вопросы и ведущие — до того, как загорится экран.
          </p>
        </div>
        <p className="relative text-sm text-stone-500">Админка студии</p>
      </section>
      <section className="relative flex items-center justify-center overflow-hidden px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,88,12,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.06),transparent_35%)]" />
        <motion.div
          className="glass-panel relative w-full max-w-sm rounded-[1.6rem] p-6"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="mb-6 text-3xl font-semibold tracking-tight text-stone-950">{title}</h2>
          {children}
        </motion.div>
      </section>
    </div>
  );
}
