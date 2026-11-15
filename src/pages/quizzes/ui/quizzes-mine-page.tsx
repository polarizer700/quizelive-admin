import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { canEditQuizzes, useSessionStore } from "@entities/session";
import { deleteQuiz, listQuizzes, quizKeys, type Quiz } from "@entities/quiz";
import { QuizTable } from "@widgets/quiz-table";
import { errorMessage } from "@shared/api";
import { Button, Notice, Panel } from "@shared/ui";

const limit = 20;

export function QuizzesMinePage() {
  const user = useSessionStore((state) => state.user);
  const canEdit = canEditQuizzes(user?.role);
  const [offset, setOffset] = useState(0);
  const [actionError, setActionError] = useState("");
  const queryClient = useQueryClient();

  const quizzes = useQuery({
    queryKey: quizKeys.list({ limit, offset }),
    queryFn: () => listQuizzes({ limit, offset }),
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

      <Panel title="Мои игры" delay={120}>
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
      </Panel>

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
