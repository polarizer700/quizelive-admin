import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowUpRight, Check, Link2, Radio } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { getQuiz, issueHostToken, quizKeys } from "@entities/quiz";
import { listQuestions, questionKeys } from "@entities/question";
import { gameTypeLabel, questionTypeLabel, statusLabel, useSessionStore } from "@entities/session";
import { ApiError, errorMessage } from "@shared/api";
import { tvDeepLink } from "@shared/config/play";
import { Badge, Button, Notice, PageHeader, Panel } from "@shared/ui";

export function GameViewPage() {
  const { gameId } = useParams({ strict: false });
  if (!gameId) return null;
  return <GameView gameId={gameId} />;
}

function GameView({ gameId }: { gameId: string }) {
  const user = useSessionStore((state) => state.user);
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState("");

  const quiz = useQuery({ queryKey: quizKeys.detail(gameId), queryFn: () => getQuiz(gameId) });
  const questions = useQuery({ queryKey: questionKeys.list(gameId), queryFn: () => listQuestions(gameId) });

  const openScreen = useMutation({
    mutationFn: () => issueHostToken(gameId),
    onSuccess: (host) => {
      window.open(tvDeepLink(host.token), "_blank", "noopener,noreferrer");
    },
    onError: (error) => setActionError(errorMessage(error, "Не удалось открыть экран")),
  });

  // Ссылка ведёт на сам экран игры в play-приложении (/tv), а не на карточку в студии.
  function copyLink() {
    setActionError("");
    issueHostToken(gameId)
      .then(async (host) => {
        await navigator.clipboard.writeText(tvDeepLink(host.token));
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch((error: unknown) => {
        setActionError(
          error instanceof ApiError && error.status === 403
            ? "Ссылку на игру может получить только её автор, ведущий или админ"
            : errorMessage(error, "Не удалось получить ссылку на игру"),
        );
      });
  }

  const own = Boolean(user && quiz.data && (user.id === quiz.data.owner_id || user.role === "admin"));
  const canHost = Boolean(
    quiz.data?.status === "published" && (user?.role === "admin" || user?.role === "host" || own),
  );

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <Link to="/quizzes" className="font-mono text-xs font-bold uppercase text-stone-500 transition hover:text-ink">
          ← К витрине
        </Link>
        <div className="mt-3">
          <PageHeader
            eyebrow="Каталог"
            title={quiz.data?.title ?? "Игра"}
            action={
              <div className="flex items-center gap-2">
                <Button tone="ghost" onClick={copyLink}>
                  {copied ? <Check size={16} /> : <Link2 size={16} />}
                  {copied ? "Скопировано" : "Ссылка на игру"}
                </Button>
                {own ? (
                  <Link
                    to="/quizzes/$quizId"
                    params={{ quizId: gameId }}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-stone-950 px-3.5 py-2 text-sm text-white transition hover:bg-stone-800"
                  >
                    Редактировать
                    <ArrowUpRight size={14} />
                  </Link>
                ) : null}
              </div>
            }
          />
        </div>
      </div>

      {actionError ? <Notice>{actionError}</Notice> : null}
      {quiz.isError ? <Notice>{errorMessage(quiz.error, "Игра не найдена или ещё не опубликована")}</Notice> : null}

      {quiz.data ? (
        <Panel title="Карточка" delay={80}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={quiz.data.status}>{statusLabel[quiz.data.status]}</Badge>
            <Badge tone="editor">{gameTypeLabel[quiz.data.game_type]}</Badge>
            {own ? <Badge tone="published">Ваша</Badge> : null}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">
            {quiz.data.description || "Без описания"}
          </p>
          {canHost ? (
            <div className="mt-4">
              <Button onClick={() => openScreen.mutateAsync().catch(() => undefined)} disabled={openScreen.isPending}>
                <Radio size={16} />
                {openScreen.isPending ? "Открываем…" : "Начать эфир"}
              </Button>
            </div>
          ) : null}
        </Panel>
      ) : null}

      {questions.data ? (
        <Panel title={`Вопросы · ${questions.data.length}`} delay={160}>
          <ul className="flex flex-col gap-2">
            {questions.data.map((question) => (
              <li
                key={question.id}
                className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/45 px-3 py-2"
              >
                {question.image_url ? (
                  <img src={question.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                ) : null}
                <div className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {question.position}. {question.text}
                  </span>
                  <span className="text-xs text-stone-500">
                    {question.category ? `${question.category} · ` : ""}
                    {questionTypeLabel[question.type]} · {question.points} б. · {question.time_limit_sec} с
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </motion.div>
  );
}
