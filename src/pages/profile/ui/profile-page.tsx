import { CalendarDays, Mail, Shield } from "lucide-react";

import { roleLabel, useSessionStore } from "@entities/session";
import { Panel } from "@shared/ui";

export function ProfilePage() {
  const user = useSessionStore((state) => state.user);

  if (!user) return null;

  const createdAt = new Date(user.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Panel title="Учётная запись">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl border-[3px] border-ink bg-acid font-mono text-2xl font-black uppercase text-ink shadow-[4px_4px_0_#111]">
            {user.email.trim()[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-black text-ink">{user.email}</p>
            <p className="font-mono text-xs uppercase text-stone-500">{roleLabel[user.role]}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3">
          <div className="flex items-center gap-3 rounded-xl border-2 border-ink bg-paper px-4 py-3">
            <Mail size={16} className="shrink-0 text-stone-500" />
            <dt className="font-mono text-xs uppercase text-stone-500">Почта</dt>
            <dd className="ml-auto truncate text-sm font-bold text-ink">{user.email}</dd>
          </div>
          <div className="flex items-center gap-3 rounded-xl border-2 border-ink bg-paper px-4 py-3">
            <Shield size={16} className="shrink-0 text-stone-500" />
            <dt className="font-mono text-xs uppercase text-stone-500">Роль</dt>
            <dd className="ml-auto text-sm font-bold text-ink">{roleLabel[user.role]}</dd>
          </div>
          <div className="flex items-center gap-3 rounded-xl border-2 border-ink bg-paper px-4 py-3">
            <CalendarDays size={16} className="shrink-0 text-stone-500" />
            <dt className="font-mono text-xs uppercase text-stone-500">В студии с</dt>
            <dd className="ml-auto text-sm font-bold text-ink">{createdAt}</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
