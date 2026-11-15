import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { canEditQuizzes, useSessionStore } from "@entities/session";
import { deleteQuiz, listQuizzes, quizKeys, type Quiz, type QuizStatus } from "@entities/quiz";
import { QuizTable } from "@widgets/quiz-table";
import { errorMessage } from "@shared/api";
import { Button, Notice } from "@shared/ui";

import { emptyQuizFilters, useDebouncedValue, type QuizFiltersValue } from "../model/filters";
import { QuizFilters } from "./quiz-filters";

const limit = 20;

export function QuizzesMinePage() {
  const user = useSessionStore((state) => state.user);
  const canEdit = canEditQuizzes(user?.role);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<QuizFiltersValue>(emptyQuizFilters);
  const [actionError, setActionError] = useState("");
  const queryClient = useQueryClient();

  const search = useDebouncedValue(filters.q.trim());
  const status = (filters.status || undefined) as QuizStatus | undefined;
  const gameType = (filters.game_type || undefined) as Quiz["game_type"] | undefined;

  // При смене фильтров возвращаемся на первую страницу (подстройка при рендере, без эффекта)
  const filterKey = `${search}${status ?? ""}${gameType ?? ""}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setOffset(0);
  }

  const quizzes = useQuery({
    queryKey: quizKeys.list({ limit, offset, status: status ?? "", game_type: gameType ?? "", q: search }),
    queryFn: () => listQuizzes({ limit, offset, status, game_type: gameType, q: search }),
  });

  const remove = useMutation({
    mutationFn: (quiz: Quiz) => deleteQuiz(quiz.id),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
    onError: (error) => setActionError(errorMessage(error, "Не удалось удалить игру")),
  });

  const total = quizzes.data?.total ?? 0;

  return (
    <>
      {actionError ? <Notice>{actionError}</Notice> : null}
      {quizzes.isError ? <Notice>{errorMessage(quizzes.error, "Не удалось загрузить игры")}</Notice> : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-ink">Мои игры</h2>
        <QuizFilters withStatus value={filters} onChange={setFilters} />
        {quizzes.isLoading ? <p className="text-sm text-stone-500">Загрузка…</p> : null}
        {quizzes.data ? (
          <QuizTable
            quizzes={quizzes.data.items}
            currentUserId={user?.id ?? ""}
            currentUserRole={user?.role}
            canEdit={canEdit}
            onDelete={(quiz) => {
              if (window.confirm(`Удалить «${quiz.title}»?`)) remove.mutate(quiz);
            }}
          />
        ) : null}
      </section>

      {total > limit ? (
        <div className="flex items-center justify-between text-sm text-stone-600">
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
    </>
  );
}
