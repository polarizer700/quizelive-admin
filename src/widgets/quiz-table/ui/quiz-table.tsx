import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import type { Quiz } from "@entities/quiz";
import { gameTypeLabel, statusLabel } from "@entities/session";
import { formatDateTime } from "@shared/lib/format";
import { Badge, Button } from "@shared/ui";

export function QuizTable({
  quizzes,
  currentUserId,
  currentUserRole,
  canEdit,
  onDelete,
}: {
  quizzes: Quiz[];
  currentUserId: string;
  currentUserRole?: string;
  canEdit: boolean;
  onDelete: (quiz: Quiz) => void;
}) {
  const reduceMotion = useReducedMotion();

  if (quizzes.length === 0) {
    return <p className="text-sm text-stone-500">Пока нет игр.</p>;
  }

  return (
    <div className="grid gap-3">
      {quizzes.map((quiz, index) => {
        const own = currentUserRole === "admin" || quiz.owner_id === currentUserId;
        return (
          <motion.article
            key={quiz.id}
            className="flex flex-col gap-4 rounded-2xl border-[3px] border-ink bg-white p-4 shadow-[5px_5px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#111] md:flex-row md:items-center md:justify-between"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-bold text-ink">{quiz.title}</h3>
                <Badge tone={quiz.status}>{statusLabel[quiz.status]}</Badge>
                <Badge tone="editor">{gameTypeLabel[quiz.game_type]}</Badge>
              </div>
              <p className="mt-1 font-mono text-xs text-stone-500">Обновлена {formatDateTime(quiz.updated_at)}</p>
              {quiz.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-600">{quiz.description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/quizzes/$quizId"
                params={{ quizId: quiz.id }}
                className="inline-flex items-center gap-1.5 rounded-xl border-[3px] border-ink bg-ink px-3.5 py-2 text-sm font-bold text-paper shadow-[3px_3px_0_rgba(17,17,17,0.35)] transition hover:bg-cobalt"
              >
                Открыть
                <ArrowUpRight size={14} />
              </Link>
              {canEdit && own ? (
                <Button tone="ghost" onClick={() => onDelete(quiz)} aria-label={`Удалить ${quiz.title}`}>
                  <Trash2 size={16} />
                </Button>
              ) : null}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
