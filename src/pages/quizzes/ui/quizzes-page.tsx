import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { canEditQuizzes, useSessionStore } from "@entities/session";
import { createQuiz, deleteQuiz, listQuizzes, quizKeys, type Quiz } from "@entities/quiz";
import { QuizForm, type QuizValues } from "@features/quiz-form";
import { QuizTable } from "@widgets/quiz-table";
import { errorMessage } from "@shared/api";
import { Button, Notice, Panel } from "@shared/ui";

const limit = 20;

export function QuizzesPage() {
  const role = useSessionStore((state) => state.user?.role);
  const canEdit = canEditQuizzes(role);
  const [offset, setOffset] = useState(0);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState("");
  const queryClient = useQueryClient();
  const query = { limit, offset };
  const quizzes = useQuery({
    queryKey: quizKeys.list(query),
    queryFn: () => listQuizzes(query),
  });

  const create = useMutation({
    mutationFn: (values: QuizValues) =>
      createQuiz({ title: values.title.trim(), description: values.description.trim() }),
    onSuccess: async () => {
      setCreating(false);
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
  });

  const remove = useMutation({
    mutationFn: (quiz: Quiz) => deleteQuiz(quiz.id),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
    onError: (error) => setActionError(errorMessage(error, "Не удалось удалить викторину")),
  });

  const total = quizzes.data?.total ?? 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-orange-700">Студия</p>
          <h1 className="font-serif text-4xl">Викторины</h1>
        </div>
        {canEdit ? (
          <Button tone={creating ? "ghost" : "primary"} onClick={() => setCreating((value) => !value)}>
            {creating ? "Закрыть" : "Новая викторина"}
          </Button>
        ) : null}
      </header>

      {actionError ? <Notice>{actionError}</Notice> : null}
      {quizzes.isError ? <Notice>{errorMessage(quizzes.error, "Не удалось загрузить викторины")}</Notice> : null}

      {creating ? (
        <Panel title="Новая викторина">
          <QuizForm submitLabel="Создать викторину" onSubmit={async (values) => { await create.mutateAsync(values); }} />
        </Panel>
      ) : null}

      <Panel title="Все викторины">
        {quizzes.isLoading ? <p className="text-sm text-stone-500">Загрузка…</p> : null}
        {quizzes.data ? (
          <QuizTable
            quizzes={quizzes.data.items}
            canEdit={canEdit}
            onDelete={(quiz) => {
              if (window.confirm(`Удалить «${quiz.title}»?`)) remove.mutate(quiz);
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
