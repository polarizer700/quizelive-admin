import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { canEditQuizzes, statusLabel, useSessionStore } from "@entities/session";
import { getQuiz, issueHostToken, quizKeys, updateQuiz } from "@entities/quiz";
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  questionKeys,
  reorderQuestions,
  updateQuestion,
  type Question,
  type QuestionInput,
} from "@entities/question";
import { QuestionForm } from "@features/question-form";
import { QuizForm, type QuizValues } from "@features/quiz-form";
import { QuestionList } from "@widgets/question-list";
import { errorMessage } from "@shared/api";
import { tvDeepLink } from "@shared/config/play";
import { Badge, Button, Notice, Panel } from "@shared/ui";

export function QuizEditorPage() {
  const { quizId } = useParams({ strict: false });
  if (!quizId) return null;
  return <QuizEditor quizId={quizId} />;
}

function QuizEditor({ quizId }: { quizId: string }) {
  const role = useSessionStore((state) => state.user?.role);
  const canEdit = canEditQuizzes(role);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const quiz = useQuery({ queryKey: quizKeys.detail(quizId), queryFn: () => getQuiz(quizId) });
  const questions = useQuery({ queryKey: questionKeys.list(quizId), queryFn: () => listQuestions(quizId) });

  const saveQuiz = useMutation({
    mutationFn: (values: QuizValues) =>
      updateQuiz(quizId, {
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status,
      }),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
  });

  const [screenURL, setScreenURL] = useState("");
  const [screenQR, setScreenQR] = useState("");

  const openScreen = useMutation({
    mutationFn: () => issueHostToken(quizId),
    onSuccess: async (host) => {
      const url = tvDeepLink(host.token);
      setScreenURL(url);
      setScreenQR(await QRCode.toDataURL(url, { margin: 1, width: 280, color: { dark: "#0c0a09", light: "#fafaf9" } }));
      window.open(url, "_blank", "noopener,noreferrer");
    },
  });

  useEffect(() => {
    setScreenURL("");
    setScreenQR("");
  }, [quizId]);

  const saveQuestion = useMutation({
    mutationFn: (body: QuestionInput) =>
      selected && selected !== "new" ? updateQuestion(quizId, selected, body) : createQuestion(quizId, body),
    onSuccess: async (question) => {
      setActionError("");
      setSelected(question.id);
      await queryClient.invalidateQueries({ queryKey: questionKeys.list(quizId) });
    },
  });

  const removeQuestion = useMutation({
    mutationFn: (questionId: string) => deleteQuestion(quizId, questionId),
    onSuccess: async () => {
      setSelected(null);
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: questionKeys.list(quizId) });
    },
    onError: (error) => setActionError(errorMessage(error, "Не удалось удалить вопрос")),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => reorderQuestions(quizId, ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: questionKeys.list(quizId) });
      const previous = queryClient.getQueryData<Question[]>(questionKeys.list(quizId));
      queryClient.setQueryData<Question[]>(questionKeys.list(quizId), (current) => {
        if (!current) return current;
        const byId = new Map(current.map((item) => [item.id, item]));
        return ids.flatMap((id, index) => {
          const item = byId.get(id);
          return item ? [{ ...item, position: index + 1 }] : [];
        });
      });
      return { previous };
    },
    onError: (error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(questionKeys.list(quizId), context.previous);
      setActionError(errorMessage(error, "Не удалось изменить порядок"));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: questionKeys.list(quizId) });
    },
  });

  const current = questions.data?.find((question) => question.id === selected) ?? null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <Link to="/quizzes" className="text-sm text-stone-500 hover:text-stone-800">
          ← К викторинам
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl">{quiz.data?.title ?? "Викторина"}</h1>
          {quiz.data ? <Badge tone={quiz.data.status}>{statusLabel[quiz.data.status]}</Badge> : null}
        </div>
      </div>

      {actionError ? <Notice>{actionError}</Notice> : null}
      {quiz.isError ? <Notice>{errorMessage(quiz.error, "Викторина не найдена")}</Notice> : null}

      {quiz.data && canEdit ? (
        <Panel title="Карточка">
          <QuizForm
            key={`${quiz.data.id}-${quiz.data.updated_at}`}
            includeStatus
            submitLabel="Сохранить"
            initial={quiz.data}
            onSubmit={async (values) => {
              await saveQuiz.mutateAsync(values);
            }}
          />
        </Panel>
      ) : null}

      {quiz.data && !canEdit ? (
        <Panel title="Карточка">
          <p className="whitespace-pre-wrap text-sm text-stone-700">{quiz.data.description || "Без описания"}</p>
        </Panel>
      ) : null}

      {quiz.data?.status === "published" ? (
        <Panel title="Эфир">
          <p className="mb-3 text-sm text-stone-600">
            Откроет экран зала в новой вкладке. Для Smart TV отсканируйте QR той же ссылкой — вводить токен не нужно.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button tone="signal" disabled={openScreen.isPending} onClick={() => openScreen.mutate()}>
              {openScreen.isPending ? "Открываем…" : "Открыть экран"}
            </Button>
            {screenURL ? (
              <Button tone="ghost" onClick={() => void navigator.clipboard.writeText(screenURL)}>
                Копировать ссылку
              </Button>
            ) : null}
          </div>
          {openScreen.isError ? (
            <div className="mt-3">
              <Notice>{errorMessage(openScreen.error)}</Notice>
            </div>
          ) : null}
          {screenQR ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
              <img alt="QR для открытия экрана на телевизоре" className="h-40 w-40 rounded-2xl bg-white p-2" src={screenQR} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Для телевизора</p>
                <p className="mt-1 break-all text-sm text-stone-600">{screenURL}</p>
              </div>
            </div>
          ) : null}
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel
          title="Вопросы"
          action={
            canEdit ? (
              <Button tone="ghost" onClick={() => setSelected("new")}>
                Новый вопрос
              </Button>
            ) : null
          }
        >
          {questions.isLoading ? <p className="text-sm text-stone-500">Загрузка…</p> : null}
          {questions.isError ? <Notice>{errorMessage(questions.error, "Не удалось загрузить вопросы")}</Notice> : null}
          {questions.data ? (
            <QuestionList
              questions={questions.data}
              selectedId={selected}
              canEdit={canEdit}
              onSelect={setSelected}
              onReorder={(ids) => reorder.mutate(ids)}
            />
          ) : null}
        </Panel>

        {canEdit && selected ? (
          <Panel title={selected === "new" ? "Новый вопрос" : "Редактор вопроса"}>
            <QuestionForm
              key={selected === "new" ? "new" : current?.id ?? selected}
              question={selected === "new" ? null : current}
              onSubmit={async (body) => {
                await saveQuestion.mutateAsync(body);
              }}
              onDelete={
                selected !== "new" && current
                  ? () => removeQuestion.mutateAsync(current.id)
                  : undefined
              }
            />
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
