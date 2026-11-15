import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Link2, PencilLine } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { listPublicGames, publicGameKeys } from "@entities/quiz";
import { gameTypeLabel, useSessionStore } from "@entities/session";
import { errorMessage } from "@shared/api";
import { formatDateTime } from "@shared/lib/format";
import { Badge, Button, Notice, PageHeader, Panel } from "@shared/ui";

const limit = 50;

export function GamesPage() {
  const user = useSessionStore((state) => state.user);
  const [offset, setOffset] = useState(0);
  const [copiedId, setCopiedId] = useState("");
  const games = useQuery({
    queryKey: publicGameKeys.list({ limit, offset }),
    queryFn: () => listPublicGames({ limit, offset }),
  });
  const reduceMotion = useReducedMotion();

  function copyLink(gameId: string) {
    const url = `${window.location.origin}/games/${gameId}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedId(gameId);
      window.setTimeout(() => setCopiedId((current) => (current === gameId ? "" : current)), 2000);
    });
  }

  const items = games.data?.items ?? [];
  const total = games.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Общее"
        title="Каталог игр"
        description="Опубликованные игры всей студии. Чужие игры можно смотреть и вести по ссылке, но редактировать — только свои."
      />

      {games.isError ? <Notice>{errorMessage(games.error, "Не удалось загрузить каталог")}</Notice> : null}

      <Panel title="Все опубликованные" delay={120}>
        {items.length === 0 && !games.isLoading ? (
          <p className="text-sm text-stone-500">Пока нет опубликованных игр.</p>
        ) : null}
        <div className="grid gap-3">
          {items.map((game, index) => {
            const own = user?.id === game.owner_id || user?.role === "admin";
            return (
              <motion.article
                key={game.id}
                className="flex flex-col gap-4 rounded-[1.3rem] border border-white/60 bg-white/45 p-4 backdrop-blur transition hover:border-orange-200/80 hover:bg-white/70 md:flex-row md:items-center md:justify-between"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-stone-950">{game.title}</h3>
                    <Badge tone="editor">{gameTypeLabel[game.game_type]}</Badge>
                    {own ? <Badge tone="published">Ваша</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {game.questions_count} вопросов · {formatDateTime(game.created_at)}
                  </p>
                  {game.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-600">{game.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button tone="ghost" onClick={() => copyLink(game.id)} aria-label="Скопировать ссылку">
                    {copiedId === game.id ? <Check size={16} /> : <Link2 size={16} />}
                    {copiedId === game.id ? "Скопировано" : "Ссылка"}
                  </Button>
                  <Link
                    to="/games/$gameId"
                    params={{ gameId: game.id }}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-stone-950 px-3.5 py-2 text-sm text-white transition hover:bg-stone-800"
                  >
                    Открыть
                    <ArrowUpRight size={14} />
                  </Link>
                  {own ? (
                    <Link
                      to="/quizzes/$quizId"
                      params={{ quizId: game.id }}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-stone-300 px-3.5 py-2 text-sm text-stone-700 transition hover:bg-white/80"
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
        {total > offset + limit ? (
          <div className="mt-4">
            <Button tone="ghost" onClick={() => setOffset((value) => value + limit)}>
              Показать ещё
            </Button>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
