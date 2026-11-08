import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { canManageUsers, logout, roleLabel, useSessionStore } from "@entities/session";
import { Button } from "@shared/ui";

export function AppShell() {
  const user = useSessionStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await logout();
    queryClient.clear();
    await navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col bg-stone-950 px-4 py-6 text-stone-100 md:min-h-screen">
        <div className="px-2">
          <p className="text-xs uppercase tracking-[0.22em] text-orange-300">QuizeLive</p>
          <p className="mt-1 font-serif text-3xl italic text-stone-50">Эфир</p>
        </div>
        <nav className="mt-8 flex gap-2 md:flex-col">
          <Link
            to="/quizzes"
            className="rounded-xl px-3 py-2 text-sm text-stone-300"
            activeProps={{ className: "rounded-xl bg-white/10 px-3 py-2 text-sm text-white" }}
          >
            Викторины
          </Link>
          {canManageUsers(user?.role) ? (
            <Link
              to="/users"
              className="rounded-xl px-3 py-2 text-sm text-stone-300"
              activeProps={{ className: "rounded-xl bg-white/10 px-3 py-2 text-sm text-white" }}
            >
              Пользователи
            </Link>
          ) : null}
        </nav>
        <div className="mt-6 flex items-center justify-between gap-3 md:mt-auto">
          <div className="min-w-0 px-2">
            <p className="truncate text-sm">{user?.email}</p>
            <p className="text-xs text-stone-400">{user ? roleLabel[user.role] : ""}</p>
          </div>
          <Button tone="ghost" className="text-stone-100 hover:bg-white/10" onClick={() => void signOut()} aria-label="Выйти">
            <LogOut size={16} />
          </Button>
        </div>
      </aside>
      <main className="px-5 py-8 md:px-10">
        <Outlet />
      </main>
    </div>
  );
}
