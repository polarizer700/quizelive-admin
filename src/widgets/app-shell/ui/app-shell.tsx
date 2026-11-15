import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Clapperboard, LayoutGrid, LogOut, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { canManageUsers, logout, roleLabel, useSessionStore } from "@entities/session";
import { Button } from "@shared/ui";
import { LegalLinks } from "@widgets/legal-links";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function pageContext(pathname: string) {
  if (pathname.startsWith("/users")) return { title: "Команда", hint: "Доступ и роли студии" };
  if (pathname === "/quizzes/new") return { title: "Новая игра", hint: "Карточка, затем вопросы" };
  if (pathname.startsWith("/quizzes/") && pathname !== "/quizzes") {
    return { title: "Редактор", hint: "Карточка, вопросы и эфир" };
  }
  return { title: "Обзор", hint: "Каталог игр и статусы" };
}

export function AppShell() {
  const user = useSessionStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduceMotion = useReducedMotion();
  const context = pageContext(pathname);

  async function signOut() {
    await logout();
    queryClient.clear();
    await navigate({ to: "/login" });
  }

  const name = user?.email?.split("@")[0] ?? "студия";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[272px_1fr]">
      <motion.aside
        className="glass-panel relative z-10 flex flex-col overflow-hidden rounded-none border-y-0 border-l-0 px-4 py-6 md:min-h-screen md:rounded-none"
        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(234,88,12,0.14),transparent_70%)]" />
        <div className="relative px-2">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-orange-700">QuizeLive</p>
          <p className="mt-1 font-serif text-3xl italic text-stone-950">Эфир</p>
          <p className="mt-2 text-sm text-stone-500">Студия игр</p>
        </div>

        <nav className="relative mt-8 flex gap-2 md:flex-col">
          <p className="mb-1 hidden px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400 md:block">
            Меню
          </p>
          <Link
            to="/quizzes"
            className="nav-link flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-stone-600 hover:bg-white/55"
            activeProps={{
              className:
                "nav-link flex items-center gap-3 rounded-2xl bg-stone-950 px-3 py-2.5 text-sm text-white shadow-lg shadow-stone-950/15",
            }}
          >
            <LayoutGrid size={16} />
            Игры
          </Link>
          {canManageUsers(user?.role) ? (
            <Link
              to="/users"
              className="nav-link flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-stone-600 hover:bg-white/55"
              activeProps={{
                className:
                  "nav-link flex items-center gap-3 rounded-2xl bg-stone-950 px-3 py-2.5 text-sm text-white shadow-lg shadow-stone-950/15",
              }}
            >
              <Users size={16} />
              Пользователи
            </Link>
          ) : null}
        </nav>

        <div className="relative mt-6 rounded-[1.4rem] border border-white/60 bg-white/55 p-4 backdrop-blur md:mt-auto">
          <div className="flex items-start gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-orange-500/15 text-orange-700">
              <Clapperboard size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">{user?.email}</p>
              <p className="text-xs text-stone-500">{user ? roleLabel[user.role] : ""}</p>
            </div>
            <Button tone="ghost" className="shrink-0" onClick={() => void signOut()} aria-label="Выйти">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </motion.aside>

      <main className="flex min-h-screen flex-col px-5 py-6 md:px-8 md:py-8">
        <motion.div
          className="glass-panel mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] px-5 py-4"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-orange-700">Студия</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">
              {greeting()}, {name}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {context.title} · {context.hint}
            </p>
          </div>
          <p className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs text-stone-600 backdrop-blur">
            Готово к эфиру
          </p>
        </motion.div>

        <div className="flex-1">
          <Outlet />
        </div>
        <LegalLinks className="mt-10 border-t border-stone-200/60 pt-4" />
      </main>
    </div>
  );
}
