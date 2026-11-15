import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { logout, roleLabel, useSessionStore } from "@entities/session";
import { cn } from "@shared/lib/cn";

function pageContext(pathname: string) {
  if (pathname.startsWith("/users")) return { title: "Команда", hint: "Доступ и роли студии" };
  if (pathname === "/quizzes/new") return { title: "Новая игра", hint: "Карточка, затем вопросы" };
  if (pathname.startsWith("/quizzes/mine")) return { title: "Витрина", hint: "Мои игры" };
  if (pathname.startsWith("/quizzes/all")) return { title: "Витрина", hint: "Все опубликованные игры" };
  if (pathname.startsWith("/quizzes/")) return { title: "Редактор", hint: "Карточка, вопросы и эфир" };
  if (pathname.startsWith("/games/")) return { title: "Игра из витрины", hint: "Просмотр и ссылка" };
  if (pathname === "/quizzes") return { title: "Витрина", hint: "Мои игры и все опубликованные" };
  if (pathname.startsWith("/profile")) return { title: "Профиль", hint: "Учётная запись" };
  return { title: "Обзор", hint: "Статистика студии" };
}

function avatarInitial(email: string | undefined) {
  return (email?.trim()[0] ?? "?").toUpperCase();
}

export function Header({ onMenuOpen }: { onMenuOpen: () => void }) {
  const user = useSessionStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduceMotion = useReducedMotion();
  const context = pageContext(pathname);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function signOut() {
    await logout();
    queryClient.clear();
    await navigate({ to: "/login" });
  }

  return (
    <motion.header
      className="glass-panel sticky top-4 z-30 mb-6 flex items-center gap-3 rounded-2xl px-4 py-3 md:px-5"
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Открыть меню"
        className="grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-paper text-ink shadow-[3px_3px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-acid hover:shadow-[5px_5px_0_#111] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#111] md:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cobalt">Студия</p>
        <p className="truncate text-xl font-black uppercase tracking-tight text-ink md:text-2xl">{context.title}</p>
        <p className="hidden truncate font-mono text-xs text-stone-500 sm:block">{context.hint}</p>
      </div>

      <button
        type="button"
        aria-label="Уведомления"
        className="relative grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-paper text-ink shadow-[3px_3px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-acid hover:shadow-[5px_5px_0_#111] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#111]"
      >
        <Bell size={18} />
      </button>

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Меню пользователя"
          className={cn(
            "flex items-center gap-1.5 rounded-xl border-[3px] border-ink bg-acid py-1 pl-1 pr-2 text-ink shadow-[3px_3px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#111]",
            menuOpen && "bg-mint",
          )}
        >
          <span className="grid size-8 place-items-center rounded-lg border-2 border-ink bg-white font-mono text-sm font-black uppercase">
            {avatarInitial(user?.email)}
          </span>
          <ChevronDown size={14} className={cn("transition-transform", menuOpen && "rotate-180")} />
        </button>

        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl border-[3px] border-ink bg-white p-2 shadow-[5px_5px_0_#111]"
          >
            <div className="border-b-2 border-dashed border-stone-300 px-3 py-2.5">
              <p className="truncate text-sm font-bold text-ink">{user?.email}</p>
              <p className="font-mono text-xs uppercase text-stone-500">{user ? roleLabel[user.role] : ""}</p>
            </div>
            <Link
              to="/profile"
              role="menuitem"
              className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-mono text-sm font-bold text-ink transition hover:bg-acid"
            >
              <UserRound size={16} />
              Профиль
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-mono text-sm font-bold text-ink transition hover:bg-pink"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}
