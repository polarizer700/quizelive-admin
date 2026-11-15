import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Link2, PencilLine, Plus } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { canEditQuizzes, gameTypeLabel, useSessionStore } from "@entities/session";
import { deleteQuiz, listPublicGames, listQuizzes, publicGameKeys, quizKeys, type Quiz } from "@entities/quiz";
import { QuizTable } from "@widgets/quiz-table";
import { errorMessage } from "@shared/api";
import { formatDateTime } from "@shared/lib/format";
import { cn } from "@shared/lib/cn";
import { Badge, Button, Notice, PageHeader, Panel } from "@shared/ui";

const limit = 20;

type Tab = "mine" | "all";

export function QuizzesPage() {
  const user = useSessionStore((state) => state.user);
  const canEdit = canEditQuizzes(user?.role);
  const [tab, setTab] = useState<Tab>("mine");
  const [offset, setOffset] = useState(0);
  const [actionError, setActionError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const queryClient = useQueryClient();

  const quizzes = useQuery({
    queryKey: quizKeys.list({ limit, offset }),
    queryFn: () => listQuizzes({ limit, offset }),
    enabled: tab === "mine",
  });
  const publicGames = useQuery({
    queryKey: publicGameKeys.list({ limit, offset }),
    queryFn: () => listPublicGames({ limit, offset }),
    enabled: tab === "all",
  });

  const remove = useMutation({
    mutationFn: (quiz: Quiz) => deleteQuiz(quiz.id),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
    onError: (error) => setActionError(errorMessage(error, "Не удалось удалить игру")),
  });

  function switchTab(next: Tab) {
    setTab(next);
    setOffset(0);
    setActionError("");
  }

  function copyLink(gameId: string) {
    const url = `${window.location.origin}/games/${gameId}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedId(gameId);
      window.setTimeout(() => setCopiedId((current) => (current === gameId ? "" : current)), 2000);
    });
  }

  const total = tab === "mine" ? (quizzes.data?.total ?? 0) : (publicGames.data?.total ?? 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Витрина"
        title="Игры"
        description="Готовьте вопросы, публикуйте пакет и открывайте экран в зале."
        action={
          canEdit ? (
            <Link
              to="/quizzes/new"
              className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-acid px-4 py-2.5 text-sm font-bold text-ink shadow-[4px_4px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111]"
            >
              <Plus size={16} />
              Новая игра
            </Link>
          ) : null
        }
      />

      <div className="flex gap-2">
        {(
          [
            ["mine", "Мои"],
            ["all", "Все игры"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            className={cn(
              "rounded-xl border-[3px] border-ink px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide transition",
              tab === key
                ? "bg-ink text-paper shadow-[3px_3px_0_rgba(17,17,17,0.35)]"
                : "bg-white text-ink shadow-[3px_3px_0_#111] hover:bg-acid",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {actionError ? <Notice>{actionError}</Notice> : null}
      {tab === "mine" && quizzes.isError ? (
        <Notice>{errorMessage(quizzes.error, "Не удалось загрузить игры")}</Notice>
      ) : null}
      {tab === "all" && publicGames.isError ? (
        <Notice>{errorMessage(publicGames.error, "Не удалось загрузить каталог")}</Notice>
      ) : null}

      {tab === "mine" ? (
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
      ) : (
        <Panel title="Все опубликованные" delay={120}>
          {publicGames.isLoading ? <p className="text-sm text-stone-500">Загрузка…</p> : null}
          {publicGames.data ? (
            <PublicGameTable
              games={publicGames.data.items}
              userId={user?.id ?? ""}
              userRole={user?.role}
              copiedId={copiedId}
              onCopy={copyLink}
            />
          ) : null}
        </Panel>
      )}

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
    </div>
  );
}

function PublicGameTable({
  games,
  userId,
  userRole,
  copiedId,
  onCopy,
}: {
  games: {
    id: string;
    title: string;
    description: string;
    owner_id: string;
    game_type: "quiz" | "pub_quiz" | "jeopardy";
    questions_count: number;
    created_at: string;
  }[];
  userId: string;
  userRole?: string;
  copiedId: string;
  onCopy: (gameId: string) => void;
}) {
  const reduceMotion = useReducedMotion();

  if (games.length === 0) {
    return <p className="text-sm text-stone-500">Пока нет опубликованных игр.</p>;
  }

  return (
    <div className="grid gap-3">
      {games.map((game, index) => {
        const own = userId === game.owner_id || userRole === "admin";
        return (
          <motion.article
            key={game.id}
            className="flex flex-col gap-4 rounded-2xl border-[3px] border-ink bg-white p-4 shadow-[5px_5px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111] md:flex-row md:items-center md:justify-between"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-bold text-ink">{game.title}</h3>
                <Badge tone="editor">{gameTypeLabel[game.game_type]}</Badge>
                {own ? <Badge tone="published">Ваша</Badge> : null}
              </div>
              <p className="mt-1 font-mono text-xs text-stone-500">
                {game.questions_count} вопросов · {formatDateTime(game.created_at)}
              </p>
              {game.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-600">{game.description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button tone="ghost" onClick={() => onCopy(game.id)} aria-label="Скопировать ссылку">
                {copiedId === game.id ? <Check size={16} /> : <Link2 size={16} />}
                {copiedId === game.id ? "Скопировано" : "Ссылка"}
              </Button>
              <Link
                to="/games/$gameId"
                params={{ gameId: game.id }}
                className="inline-flex items-center gap-1.5 rounded-xl border-[3px] border-ink bg-ink px-3.5 py-2 text-sm font-bold text-paper shadow-[3px_3px_0_rgba(17,17,17,0.35)] transition hover:bg-cobalt"
              >
                Открыть
                <ArrowUpRight size={14} />
              </Link>
              {own ? (
                <Link
                  to="/quizzes/$quizId"
                  params={{ quizId: game.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl border-[3px] border-ink bg-white px-3.5 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_#111] transition hover:bg-acid"
                >
                  <PencilLine size={14} />
                  Править
                </Link>
              ) : null}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
