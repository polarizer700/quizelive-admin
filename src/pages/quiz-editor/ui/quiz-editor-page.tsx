import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { HelpCircle, Timer } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import QRCode from "qrcode";
import { useMemo, useState } from "react";

import { canEditQuizzes, statusLabel, useSessionStore } from "@entities/session";
import { getQuiz, issueHostToken, quizKeys, updateQuiz } from "@entities/quiz";
import {
  createQuestion,
  deleteQuestion,
  deleteQuestionImage,
  listQuestions,
  questionKeys,
  reorderQuestions,
  updateQuestion,
  uploadQuestionImage,
  type Question,
  type QuestionInput,
} from "@entities/question";
import { QuestionForm } from "@features/question-form";
import { QuizForm, type QuizValues } from "@features/quiz-form";
import { QuestionList } from "@widgets/question-list";
import { errorMessage } from "@shared/api";
import { tvDeepLink } from "@shared/config/play";
import { Badge, Button, Notice, Panel, StatCard, TrendArea } from "@shared/ui";

export function QuizEditorPage() {
  const { quizId } = useParams({ strict: false });
  if (!quizId) return null;
  return <QuizEditor quizId={quizId} />;
}

function QuizEditor({ quizId }: { quizId: string }) {
  const role = useSessionStore((state) => state.user?.role);
  const canEdit = canEditQuizzes(role);
  const queryClient = useQueryClient();
  const [chosen, setChosen] = useState<string | null>(null);
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

  const [screen, setScreen] = useState<{ quizId: string; url: string; qr: string } | null>(null);
  const screenURL = screen?.quizId === quizId ? screen.url : "";
  const screenQR = screen?.quizId === quizId ? screen.qr : "";

  const openScreen = useMutation({
    mutationFn: () => issueHostToken(quizId),
    onSuccess: async (host) => {
      const url = tvDeepLink(host.token);
      const qr = await QRCode.toDataURL(url, { margin: 1, width: 280, color: { dark: "#0c0a09", light: "#fafaf9" } });
      setScreen({ quizId, url, qr });
      window.open(url, "_blank", "noopener,noreferrer");
    },
  });

  const saveQuestion = useMutation({
    mutationFn: (body: QuestionInput) =>
      chosen && chosen !== "new" ? updateQuestion(quizId, chosen, body) : createQuestion(quizId, body),
    onSuccess: async (question) => {
      setActionError("");
      setChosen(question.id);
      await queryClient.invalidateQueries({ queryKey: questionKeys.list(quizId) });
    },
  });

  const removeQuestion = useMutation({
    mutationFn: (questionId: string) => deleteQuestion(quizId, questionId),
    onSuccess: async () => {
      setChosen(null);
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

  const selected = chosen ?? (canEdit && questions.data?.length === 0 ? "new" : null);
  const current = questions.data?.find((question) => question.id === selected) ?? null;
  const reduceMotion = useReducedMotion();

  const questionStats = useMemo(() => {
    const list = questions.data ?? [];
    const points = list.reduce((sum, question) => sum + (question.points ?? 0), 0);
    const avgTime =
      list.length === 0
        ? 0
        : Math.round(list.reduce((sum, question) => sum + (question.time_limit_sec ?? 0), 0) / list.length);
    const trend = list.map((question, index) => ({
      label: String(index + 1),
      value: question.points ?? 0,
      secondary: Math.round((question.time_limit_sec ?? 0) / 5),
    }));
    return { count: list.length, points, avgTime, trend };
  }, [questions.data]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/quizzes" className="text-sm text-stone-500 transition hover:text-stone-800">
          ← К викторинам
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
            {quiz.data?.title ?? "Викторина"}
          </h1>
          {quiz.data ? <Badge tone={quiz.data.status}>{statusLabel[quiz.data.status]}</Badge> : null}
        </div>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">Карточка, вопросы и запуск экрана для зала.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Вопросы"
          value={questionStats.count}
          hint="в пакете"
          icon={<HelpCircle size={18} />}
          delay={40}
          sparkline={questionStats.trend.map((point) => point.value).concat([0, 1])}
        />
        <StatCard
          label="Среднее время"
          value={`${questionStats.avgTime} с`}
          hint={`${questionStats.points} баллов суммарно`}
          icon={<Timer size={18} />}
          delay={100}
        />
      </div>

      {questionStats.trend.length > 0 ? (
        <Panel title="Баллы по вопросам" delay={140}>
          <TrendArea data={questionStats.trend} primaryLabel="Баллы" secondaryLabel="Время ÷ 5" />
        </Panel>
      ) : null}

      {actionError ? <Notice>{actionError}</Notice> : null}
      {quiz.isError ? <Notice>{errorMessage(quiz.error, "Викторина не найдена")}</Notice> : null}

      {quiz.data && canEdit ? (
        <Panel title="Карточка" delay={180}>
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
        <Panel title="Карточка" delay={180}>
          <p className="whitespace-pre-wrap text-sm text-stone-700">{quiz.data.description || "Без описания"}</p>
        </Panel>
      ) : null}

      {quiz.data?.status === "published" ? (
        <Panel title="Эфир" delay={200}>
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
              <img
                alt="QR для открытия экрана на телевизоре"
                className="h-40 w-40 rounded-2xl border border-white/70 bg-white/80 p-2 backdrop-blur"
                src={screenQR}
              />
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
          delay={240}
          action={
            canEdit ? (
              <Button tone="ghost" onClick={() => setChosen("new")}>
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
              onSelect={setChosen}
              onReorder={(ids) => reorder.mutate(ids)}
            />
          ) : null}
        </Panel>

        {canEdit && selected ? (
          <Panel title={selected === "new" ? "Новый вопрос" : "Редактор вопроса"} delay={280}>
            <QuestionForm
              key={selected === "new" ? "new" : current?.id ?? selected}
              question={selected === "new" ? null : current}
              onSubmit={async (body, image) => {
                const saved = await saveQuestion.mutateAsync(body);
                if (image) {
                  await uploadQuestionImage(quizId, saved.id, image);
                  await queryClient.invalidateQueries({ queryKey: questionKeys.list(quizId) });
                }
              }}
              onDelete={
                selected !== "new" && current
                  ? () => removeQuestion.mutateAsync(current.id)
                  : undefined
              }
              onUploadImage={
                selected !== "new" && current
                  ? async (file) => {
                      await uploadQuestionImage(quizId, current.id, file);
                      await queryClient.invalidateQueries({ queryKey: questionKeys.list(quizId) });
                    }
                  : undefined
              }
              onDeleteImage={
                selected !== "new" && current
                  ? async () => {
                      await deleteQuestionImage(quizId, current.id);
                      await queryClient.invalidateQueries({ queryKey: questionKeys.list(quizId) });
                    }
                  : undefined
              }
            />
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
