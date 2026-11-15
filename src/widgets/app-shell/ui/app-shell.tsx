import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Clapperboard, Gauge, LayoutGrid, LogOut, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { canManageUsers, logout, roleLabel, useSessionStore } from "@entities/session";
import { Button } from "@shared/ui";
import { LegalLinks } from "@widgets/legal-links";

function pageContext(pathname: string) {
  if (pathname.startsWith("/users")) return { title: "Команда", hint: "Доступ и роли студии" };
  if (pathname === "/quizzes/new") return { title: "Новая игра", hint: "Карточка, затем вопросы" };
  if (pathname.startsWith("/quizzes/") && pathname !== "/quizzes") {
    return { title: "Редактор", hint: "Карточка, вопросы и эфир" };
  }
  if (pathname.startsWith("/games/")) return { title: "Игра из витрины", hint: "Просмотр и ссылка" };
  if (pathname === "/quizzes") return { title: "Витрина", hint: "Мои игры и все опубликованные" };
  return { title: "Обзор", hint: "Статистика студии" };
}

const navLinkClass =
  "nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-sm font-bold text-ink hover:bg-acid";
const navLinkActiveClass =
  "nav-link flex items-center gap-3 rounded-xl border-2 border-ink bg-ink px-3 py-2.5 font-mono text-sm font-bold text-paper shadow-[3px_3px_0_rgba(17,17,17,0.3)]";

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

  return (
    <div className="min-h-screen md:grid md:grid-cols-[272px_1fr]">
      <motion.aside
        className="relative z-10 flex flex-col border-b-[3px] border-ink bg-white px-4 py-6 md:min-h-screen md:border-b-0 md:border-r-[3px]"
        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative px-2">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cobalt">QuizeLive</p>
          <p className="mt-1 text-3xl font-black uppercase leading-none tracking-tight text-ink">Студия</p>
          <p className="mt-2 font-mono text-xs text-stone-500">викторины · квизы · своя игра</p>
        </div>

        <nav className="relative mt-8 flex gap-2 md:flex-col">
          <p className="mb-1 hidden px-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 md:block">
            Меню
          </p>
          <Link to="/dashboard" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>
            <Gauge size={16} />
            Обзор
          </Link>
          <Link
            to="/quizzes"
            className={navLinkClass}
            activeProps={{ className: navLinkActiveClass }}
            activeOptions={{ includeSearch: false }}
          >
            <LayoutGrid size={16} />
            Игры
          </Link>
          {canManageUsers(user?.role) ? (
            <Link to="/users" className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>
              <Users size={16} />
              Пользователи
            </Link>
          ) : null}
        </nav>

        <div className="relative mt-6 rounded-2xl border-[3px] border-ink bg-paper p-4 shadow-[4px_4px_0_#111] md:mt-auto">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-acid text-ink">
              <Clapperboard size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{user?.email}</p>
              <p className="font-mono text-xs uppercase text-stone-500">{user ? roleLabel[user.role] : ""}</p>
            </div>
            <Button tone="ghost" className="shrink-0 px-2 py-1.5" onClick={() => void signOut()} aria-label="Выйти">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </motion.aside>

      <main className="flex min-h-screen flex-col px-5 py-6 md:px-8 md:py-8">
        <motion.div
          className="glass-panel mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cobalt">Студия</p>
            <p className="mt-1 text-2xl font-black uppercase tracking-tight text-ink">{context.title}</p>
            <p className="mt-1 font-mono text-xs text-stone-500">{context.hint}</p>
          </div>
          <p className="rounded-lg border-2 border-ink bg-mint px-3 py-1 font-mono text-xs font-bold uppercase text-ink">
            Готово к эфиру
          </p>
        </motion.div>

        <div className="flex-1">
          <Outlet />
        </div>
        <LegalLinks className="mt-10 border-t-[3px] border-ink pt-4" />
      </main>
    </div>
  );
}
