import type { ReactNode } from "react";

export function AuthFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-between bg-stone-950 px-8 py-10 text-stone-50">
        <p className="text-xs uppercase tracking-[0.22em] text-orange-300">QuizeLive</p>
        <div>
          <h1 className="max-w-md font-serif text-5xl italic leading-tight">Эфир начинается здесь</h1>
          <p className="mt-4 max-w-sm text-stone-300">Викторины, вопросы и ведущие — до того, как загорится экран.</p>
        </div>
        <p className="text-sm text-stone-500">Админка студии</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="mb-6 font-serif text-3xl">{title}</h2>
          {children}
        </div>
      </section>
    </div>
  );
}
