import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useSessionStore } from "@entities/session";
import { createUser, deleteUser, listUsers, updateUser, userKeys, type User, type UserRole } from "@entities/user";
import { UserForm, type UserValues } from "@features/user-form";
import { UserTable } from "@widgets/user-table";
import { errorMessage } from "@shared/api";
import { Button, Notice, Panel } from "@shared/ui";

const limit = 20;

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

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-orange-700">Доступ</p>
        <h1 className="font-serif text-4xl">Пользователи</h1>
      </header>
      {actionError ? <Notice>{actionError}</Notice> : null}
      {users.isError ? <Notice>{errorMessage(users.error, "Не удалось загрузить пользователей")}</Notice> : null}
      <Panel title="Новый пользователь">
        <UserForm
          onSubmit={async (values) => {
            await create.mutateAsync(values);
          }}
        />
      </Panel>
      <Panel title="Команда">
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
