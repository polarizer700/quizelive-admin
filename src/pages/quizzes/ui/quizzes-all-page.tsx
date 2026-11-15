import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Link2, PencilLine } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { gameTypeLabel, useSessionStore } from "@entities/session";
import { issueHostToken, listPublicGames, publicGameKeys, type PublicGame } from "@entities/quiz";
import { ApiError, errorMessage } from "@shared/api";
import { tvDeepLink } from "@shared/config/play";
import { formatDateTime } from "@shared/lib/format";
import { Badge, Button, Notice } from "@shared/ui";

import { emptyQuizFilters, useDebouncedValue, type QuizFiltersValue } from "../model/filters";
import { QuizFilters } from "./quiz-filters";

const limit = 20;

export function QuizzesAllPage() {
  const user = useSessionStore((state) => state.user);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<QuizFiltersValue>(emptyQuizFilters);
  const [copiedId, setCopiedId] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [actionError, setActionError] = useState("");

  const search = useDebouncedValue(filters.q.trim());
  const gameType = (filters.game_type || undefined) as PublicGame["game_type"] | undefined;

  // При смене фильтров возвращаемся на первую страницу (подстройка при рендере, без эффекта)
  const filterKey = `${search}${gameType ?? ""}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setOffset(0);
  }

  const publicGames = useQuery({
    queryKey: publicGameKeys.list({ limit, offset, game_type: gameType ?? "", q: search }),
    queryFn: () => listPublicGames({ limit, offset, game_type: gameType, q: search }),
  });

  // Ссылка ведёт на сам экран игры в play-приложении (/tv), а не на карточку в студии.
  async function copyGameLink(gameId: string) {
    setActionError("");
    setPendingId(gameId);
    try {
      const host = await issueHostToken(gameId);
      await navigator.clipboard.writeText(tvDeepLink(host.token));
      setCopiedId(gameId);
      window.setTimeout(() => setCopiedId((current) => (current === gameId ? "" : current)), 2000);
    } catch (error) {
      setActionError(
        error instanceof ApiError && error.status === 403
          ? "Ссылку на игру может получить только её автор, ведущий или админ"
          : errorMessage(error, "Не удалось получить ссылку на игру"),
      );
    } finally {
      setPendingId("");
    }
  }

  const total = publicGames.data?.total ?? 0;

  return (
    <>
      {actionError ? <Notice>{actionError}</Notice> : null}
      {publicGames.isError ? (
        <Notice>{errorMessage(publicGames.error, "Не удалось загрузить каталог")}</Notice>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-ink">Все опубликованные</h2>
        <QuizFilters value={filters} onChange={setFilters} />
        {publicGames.isLoading ? <p className="text-sm text-stone-500">Загрузка…</p> : null}
        {publicGames.data ? (
          <PublicGameTable
            games={publicGames.data.items}
            userId={user?.id ?? ""}
            userRole={user?.role}
            copiedId={copiedId}
            pendingId={pendingId}
            onCopy={(gameId) => void copyGameLink(gameId)}
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

function PublicGameTable({
  games,
  userId,
  userRole,
  copiedId,
  pendingId,
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
  pendingId: string;
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
              <Button
                tone="ghost"
                onClick={() => onCopy(game.id)}
                disabled={pendingId === game.id}
                aria-label="Скопировать ссылку на игру"
              >
                {copiedId === game.id ? <Check size={16} /> : <Link2 size={16} />}
                {copiedId === game.id ? "Скопировано" : pendingId === game.id ? "Получаем…" : "Ссылка на игру"}
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
