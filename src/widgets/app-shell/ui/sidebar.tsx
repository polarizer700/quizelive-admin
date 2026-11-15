import { Link } from "@tanstack/react-router";
import { Clapperboard, Gauge, LayoutGrid, PanelLeftClose, PanelLeftOpen, Users } from "lucide-react";

import { canManageUsers, useSessionStore } from "@entities/session";
import { cn } from "@shared/lib/cn";

// Роутер склеивает className и activeProps.className — конфликтующие утилиты
// (bg-*, text-*, border-*) держим только в active/inactive вариантах.
const navLinkBaseClass = "nav-link flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 font-mono text-sm font-bold";
const navLinkActiveClass = "border-ink bg-ink text-paper shadow-[3px_3px_0_rgba(17,17,17,0.3)]";
const navLinkInactiveClass = "border-transparent text-ink hover:border-ink hover:bg-acid";

const toggleClass =
  "grid size-10 place-items-center rounded-xl border-[3px] border-ink bg-paper text-ink shadow-[3px_3px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-acid hover:shadow-[5px_5px_0_#111] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#111]";

export function Sidebar({
  onNavigate,
  className,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const role = useSessionStore((state) => state.user?.role);
  const linkClass = cn(navLinkBaseClass, collapsed && "w-11 justify-center px-0");

  return (
    <div className={cn("flex h-full flex-col py-6", collapsed ? "items-center px-2" : "px-4", className)}>
      <div className={cn("relative", collapsed ? "text-center" : "px-2")}>
        {collapsed ? (
          <p className="text-xl font-black uppercase leading-none tracking-tight text-ink" title="QuizeLive Студия">
            QL
          </p>
        ) : (
          <>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cobalt">QuizeLive</p>
            <p className="mt-1 text-3xl font-black uppercase leading-none tracking-tight text-ink">Студия</p>
            <p className="mt-2 font-mono text-xs text-stone-500">викторины · квизы · своя игра</p>
          </>
        )}
      </div>

      <nav className={cn("relative mt-8 flex w-full flex-col gap-2", collapsed && "items-center")}>
        {collapsed ? null : (
          <p className="mb-1 px-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Меню</p>
        )}
        <Link
          to="/dashboard"
          onClick={onNavigate}
          title={collapsed ? "Обзор" : undefined}
          className={linkClass}
          activeProps={{ className: navLinkActiveClass }}
          inactiveProps={{ className: navLinkInactiveClass }}
        >
          <Gauge size={16} className="shrink-0" />
          {collapsed ? <span className="sr-only">Обзор</span> : "Обзор"}
        </Link>
        <Link
          to="/quizzes"
          onClick={onNavigate}
          title={collapsed ? "Игры" : undefined}
          className={linkClass}
          activeProps={{ className: navLinkActiveClass }}
          inactiveProps={{ className: navLinkInactiveClass }}
          activeOptions={{ includeSearch: false }}
        >
          <LayoutGrid size={16} className="shrink-0" />
          {collapsed ? <span className="sr-only">Игры</span> : "Игры"}
        </Link>
        {canManageUsers(role) ? (
          <Link
            to="/users"
            onClick={onNavigate}
            title={collapsed ? "Пользователи" : undefined}
            className={linkClass}
            activeProps={{ className: navLinkActiveClass }}
            inactiveProps={{ className: navLinkInactiveClass }}
          >
            <Users size={16} className="shrink-0" />
            {collapsed ? <span className="sr-only">Пользователи</span> : "Пользователи"}
          </Link>
        ) : null}
      </nav>

      <div className="relative mt-auto flex w-full flex-col items-center gap-3">
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Развернуть меню" : "Свернуть меню до иконок"}
            title={collapsed ? "Развернуть меню" : "Свернуть меню до иконок"}
            className={toggleClass}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        ) : null}
        {collapsed ? (
          <div
            className="grid size-10 place-items-center rounded-xl border-[3px] border-ink bg-acid text-ink"
            title="Готово к эфиру"
          >
            <Clapperboard size={18} />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-paper p-4 shadow-[4px_4px_0_#111]">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-acid text-ink">
              <Clapperboard size={18} />
            </div>
            <p className="font-mono text-xs font-bold uppercase leading-snug text-ink">
              Готово
              <br />к эфиру
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
