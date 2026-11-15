import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

import { canEditQuizzes, useSessionStore } from "@entities/session";
import { createQuiz, quizKeys } from "@entities/quiz";
import { QuizForm, type QuizValues } from "@features/quiz-form";
import { Button, PageHeader, Panel } from "@shared/ui";

export function QuizCreatePage() {
  const role = useSessionStore((state) => state.user?.role);
  const canEdit = canEditQuizzes(role);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();

  const create = useMutation({
    mutationFn: (values: QuizValues) =>
      createQuiz({
        title: values.title.trim(),
        description: values.description.trim(),
        game_type: values.game_type,
        break_after_round: values.break_after_round,
      }),
    onSuccess: async (quiz) => {
      await queryClient.invalidateQueries({ queryKey: quizKeys.all });
      await navigate({ to: "/quizzes/$quizId", params: { quizId: quiz.id } });
    },
  });

  if (!canEdit) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <PageHeader title="Нет доступа" description="Создавать игры могут редакторы и админы." />
        <Link to="/quizzes" className="text-sm text-stone-500 transition hover:text-stone-800">
          ← К играм
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto flex w-full max-w-2xl flex-col gap-6"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <Link to="/quizzes" className="text-sm text-stone-500 transition hover:text-stone-800">
          ← К викторинам
        </Link>
        <div className="mt-3">
          <PageHeader
            eyebrow="Новая"
            title="Создать игру"
            description="Заполните карточку — сразу откроется редактор, где можно добавить вопросы."
          />
        </div>
      </div>

      <Panel title="Карточка" delay={80}>
        <QuizForm
          submitLabel="Создать и перейти к вопросам"
          onSubmit={async (values) => {
            await create.mutateAsync(values);
          }}
        />
        <div className="mt-4">
          <Button tone="ghost" onClick={() => void navigate({ to: "/quizzes" })}>
            Отмена
          </Button>
        </div>
      </Panel>
    </motion.div>
  );
}
