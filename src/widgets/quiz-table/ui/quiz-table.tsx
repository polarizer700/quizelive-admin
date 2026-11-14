import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import type { Quiz } from "@entities/quiz";
import { statusLabel } from "@entities/session";
import { formatDateTime } from "@shared/lib/format";
import { Badge, Button } from "@shared/ui";

export function QuizTable({
  quizzes,
  canEdit,
  onDelete,
}: {
  quizzes: Quiz[];
  canEdit: boolean;
  onDelete: (quiz: Quiz) => void;
}) {
  const reduceMotion = useReducedMotion();

  if (quizzes.length === 0) {
    return <p className="text-sm text-stone-500">Пока нет викторин.</p>;
  }

  return (
    <div className="grid gap-3">
      {quizzes.map((quiz, index) => (
        <motion.article
          key={quiz.id}
          className="group flex flex-col gap-4 rounded-[1.3rem] border border-white/60 bg-white/45 p-4 backdrop-blur transition hover:border-orange-200/80 hover:bg-white/70 md:flex-row md:items-center md:justify-between"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduceMotion ? undefined : { y: -2 }}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-medium text-stone-950">{quiz.title}</h3>
              <Badge tone={quiz.status}>{statusLabel[quiz.status]}</Badge>
            </div>
            <p className="mt-1 text-sm text-stone-500">Обновлена {formatDateTime(quiz.updated_at)}</p>
            {quiz.description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-600">{quiz.description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/quizzes/$quizId"
              params={{ quizId: quiz.id }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-stone-950 px-3.5 py-2 text-sm text-white transition hover:bg-stone-800"
            >
              Открыть
              <ArrowUpRight size={14} />
            </Link>
            {canEdit ? (
              <Button tone="ghost" onClick={() => onDelete(quiz)} aria-label={`Удалить ${quiz.title}`}>
                <Trash2 size={16} />
              </Button>
            ) : null}
          </div>
        </motion.article>
      ))}
    </div>
  );
}
