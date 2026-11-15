import { Link, Outlet } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { canEditQuizzes, useSessionStore } from "@entities/session";
import { PageHeader } from "@shared/ui";

const tabClass =
  "rounded-xl border-[3px] border-ink bg-white px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide text-ink shadow-[3px_3px_0_#111] transition hover:bg-acid";
const tabActiveClass =
  "rounded-xl border-[3px] border-ink bg-ink px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide text-paper shadow-[3px_3px_0_rgba(17,17,17,0.35)] transition";

export function QuizzesPage() {
  const user = useSessionStore((state) => state.user);
  const canEdit = canEditQuizzes(user?.role);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Витрина"
        title="Игры"
        description="Готовьте вопросы, публикуйте пакет и открывайте экран в зале."
        action={
          canEdit ? (
            <Link
              to="/quizzes/new"
              className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-acid px-4 py-2.5 text-sm font-bold text-ink shadow-[4px_4px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111]"
            >
              <Plus size={16} />
              Новая игра
            </Link>
          ) : null
        }
      />

      <nav className="flex gap-2">
        <Link to="/quizzes/mine" className={tabClass} activeProps={{ className: tabActiveClass }}>
          Мои
        </Link>
        <Link to="/quizzes/all" className={tabClass} activeProps={{ className: tabActiveClass }}>
          Все игры
        </Link>
      </nav>

      <Outlet />
    </div>
  );
}
