import { Link } from "@tanstack/react-router";
import { Clapperboard, Gauge, LayoutGrid, Users } from "lucide-react";

import { canManageUsers, useSessionStore } from "@entities/session";
import { cn } from "@shared/lib/cn";

const navLinkClass =
  "nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-sm font-bold text-ink hover:bg-acid";
const navLinkActiveClass =
  "nav-link flex items-center gap-3 rounded-xl border-2 border-ink bg-ink px-3 py-2.5 font-mono text-sm font-bold text-paper shadow-[3px_3px_0_rgba(17,17,17,0.3)]";

export function Sidebar({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const role = useSessionStore((state) => state.user?.role);

  return (
    <div className={cn("flex h-full flex-col px-4 py-6", className)}>
      <div className="relative px-2">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cobalt">QuizeLive</p>
        <p className="mt-1 text-3xl font-black uppercase leading-none tracking-tight text-ink">Студия</p>
        <p className="mt-2 font-mono text-xs text-stone-500">викторины · квизы · своя игра</p>
      </div>

      <nav className="relative mt-8 flex flex-col gap-2">
        <p className="mb-1 px-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Меню</p>
        <Link to="/dashboard" onClick={onNavigate} className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>
          <Gauge size={16} />
          Обзор
        </Link>
        <Link
          to="/quizzes"
          onClick={onNavigate}
          className={navLinkClass}
          activeProps={{ className: navLinkActiveClass }}
          activeOptions={{ includeSearch: false }}
        >
          <LayoutGrid size={16} />
          Игры
        </Link>
        {canManageUsers(role) ? (
          <Link to="/users" onClick={onNavigate} className={navLinkClass} activeProps={{ className: navLinkActiveClass }}>
            <Users size={16} />
            Пользователи
          </Link>
        ) : null}
      </nav>

      <div className="relative mt-auto flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-paper p-4 shadow-[4px_4px_0_#111]">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-acid text-ink">
          <Clapperboard size={18} />
        </div>
        <p className="font-mono text-xs font-bold uppercase leading-snug text-ink">
          Готово
          <br />к эфиру
        </p>
      </div>
    </div>
  );
}
