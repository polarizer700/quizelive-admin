import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { useSessionStore } from "@entities/session";
import { createUser, deleteUser, listUsers, updateUser, userKeys, type User, type UserRole } from "@entities/user";
import { UserForm, type UserValues } from "@features/user-form";
import { UserTable } from "@widgets/user-table";
import { errorMessage } from "@shared/api";
import { Button, Notice, PageHeader, Panel, StatCard, StatusDonut, TrendArea } from "@shared/ui";

const limit = 20;

function buildRoleTrend(items: User[]) {
  const buckets = new Map<string, number>();
  const sorted = [...items].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  let running = 0;
  for (const user of sorted) {
    const key = new Date(user.created_at).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
    running += 1;
    buckets.set(key, running);
  }
  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
}

export function UsersPage() {
  const currentUserId = useSessionStore((state) => state.user?.id ?? "");
  const [offset, setOffset] = useState(0);
  const [actionError, setActionError] = useState("");
  const queryClient = useQueryClient();
  const query = { limit, offset };
  const users = useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => listUsers(query),
  });

  const create = useMutation({
    mutationFn: (values: UserValues) => createUser(values),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });

  const changeRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => updateUser(userId, { role }),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => setActionError(errorMessage(error, "Не удалось сменить роль")),
  });

  const remove = useMutation({
    mutationFn: (user: User) => deleteUser(user.id),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => setActionError(errorMessage(error, "Не удалось удалить пользователя")),
  });

  const total = users.data?.total ?? 0;
  const items = users.data?.items ?? [];
  const stats = useMemo(() => {
    const admins = items.filter((user) => user.role === "admin").length;
    const editors = items.filter((user) => user.role === "editor").length;
    const hosts = items.filter((user) => user.role === "host").length;
    return {
      admins,
      editors,
      hosts,
      trend: buildRoleTrend(items),
      spark: items.map((_, index) => index + 1),
    };
  }, [items]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Доступ"
        title="Пользователи"
        description="Команда студии: кто готовит викторины и кто управляет доступом."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="В списке"
          value={total}
          hint="учётные записи"
          icon={<Users size={18} />}
          delay={40}
          sparkline={stats.spark.length > 1 ? stats.spark : [0, total || 1]}
        />
        <StatCard
          label="Админы"
          value={stats.admins}
          hint="на этой странице"
          icon={<Shield size={18} />}
          delay={100}
          change={stats.admins > 0 ? `${stats.admins} admin` : undefined}
          changePositive
        />
        <StatCard
          label="Редакторы"
          value={stats.editors}
          hint="готовят контент"
          icon={<UserRound size={18} />}
          delay={160}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Рост команды" delay={180}>
          <TrendArea data={stats.trend} primaryLabel="Пользователи" />
        </Panel>
        <Panel title="Роли" delay={220}>
          <StatusDonut
            slices={[
              { name: "Админы", value: stats.admins, color: "#1c1917" },
              { name: "Редакторы", value: stats.editors, color: "#ea580c" },
              { name: "Ведущие", value: stats.hosts, color: "#0ea5e9" },
            ]}
            centerValue={items.length}
            centerLabel="на странице"
          />
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-stone-900" /> Админы
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-orange-600" /> Редакторы
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-sky-500" /> Ведущие
            </span>
          </div>
        </Panel>
      </div>

      {actionError ? <Notice>{actionError}</Notice> : null}
      {users.isError ? <Notice>{errorMessage(users.error, "Не удалось загрузить пользователей")}</Notice> : null}

      <Panel title="Новый пользователь" delay={240}>
        <UserForm
          onSubmit={async (values) => {
            await create.mutateAsync(values);
          }}
        />
      </Panel>

      <Panel title="Команда" delay={280}>
        {users.isLoading ? <p className="text-sm text-stone-500">Загрузка…</p> : null}
        {users.data ? (
          <UserTable
            users={users.data.items}
            currentUserId={currentUserId}
            onRole={(userId, role) => changeRole.mutate({ userId, role })}
            onDelete={(user) => {
              if (window.confirm(`Удалить ${user.email}?`)) remove.mutate(user);
            }}
          />
        ) : null}
        {total > limit ? (
          <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
            <span>
              {offset + 1}–{Math.min(offset + limit, total)} из {total}
            </span>
            <div className="flex gap-2">
              <Button tone="ghost" disabled={offset === 0} onClick={() => setOffset((value) => Math.max(0, value - limit))}>
                Назад
              </Button>
              <Button tone="ghost" disabled={offset + limit >= total} onClick={() => setOffset((value) => value + limit)}>
                Дальше
              </Button>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
