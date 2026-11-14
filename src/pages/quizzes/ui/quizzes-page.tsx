import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FileText, Plus, Radio, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { canEditQuizzes, useSessionStore } from "@entities/session";
import { deleteQuiz, listQuizzes, quizKeys, type Quiz } from "@entities/quiz";
import { QuizTable } from "@widgets/quiz-table";
import { errorMessage } from "@shared/api";
import { Button, Notice, PageHeader, Panel, StatCard, StatusDonut, TrendArea } from "@shared/ui";

const limit = 20;

function buildTrend(items: Quiz[]) {
  const buckets = new Map<string, { published: number; draft: number }>();
  const sorted = [...items].sort(
    (a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
  );

  for (const quiz of sorted) {
    const key = new Date(quiz.updated_at).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
    const current = buckets.get(key) ?? { published: 0, draft: 0 };
    if (quiz.status === "published") current.published += 1;
    else current.draft += 1;
    buckets.set(key, current);
  }

  let published = 0;
  let draft = 0;
  return [...buckets.entries()].map(([label, counts]) => {
    published += counts.published;
    draft += counts.draft;
    return { label, value: published, secondary: draft };
  });
}

export function QuizzesPage() {
  const role = useSessionStore((state) => state.user?.role);
  const canEdit = canEditQuizzes(role);
  const [offset, setOffset] = useState(0);
  const [actionError, setActionError] = useState("");
  const queryClient = useQueryClient();
  const query = { limit, offset };
  const quizzes = useQuery({
    queryKey: quizKeys.list(query),
    queryFn: () => listQuizzes(query),
  });

  const remove = useMutation({
    mutationFn: (quiz: Quiz) => deleteQuiz(quiz.id),
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey: quizKeys.all });
    },
    onError: (error) => setActionError(errorMessage(error, "Не удалось удалить викторину")),
  });

  const total = quizzes.data?.total ?? 0;
  const items = quizzes.data?.items ?? [];
  const stats = useMemo(() => {
    const published = items.filter((quiz) => quiz.status === "published").length;
    const drafts = items.filter((quiz) => quiz.status === "draft").length;
    const spark = items.map((_, index) => index + 1);
    const trend = buildTrend(items);
    return { published, drafts, spark, trend };
  }, [items]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Каталог"
        title="Викторины"
        description="Готовьте вопросы, публикуйте пакет и открывайте экран в зале."
        action={
          canEdit ? (
            <Link
              to="/quizzes/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
            >
              <Plus size={16} />
              Новая викторина
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Всего"
          value={total}
          hint="в текущем списке"
          icon={<Sparkles size={18} />}
          delay={40}
          sparkline={stats.spark.length > 1 ? stats.spark : [0, total || 1]}
        />
        <StatCard
          label="В эфире"
          value={stats.published}
          hint="опубликованы"
          icon={<Radio size={18} />}
          delay={100}
          change={stats.published > 0 ? `${stats.published} live` : undefined}
          changePositive
          sparkline={items.map((quiz) => (quiz.status === "published" ? 1 : 0)).concat([0, 1])}
        />
        <StatCard
          label="Черновики"
          value={stats.drafts}
          hint="ещё готовятся"
          icon={<FileText size={18} />}
          delay={160}
          sparkline={items.map((quiz) => (quiz.status === "draft" ? 1 : 0)).concat([0, 1])}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Активность по обновлениям" delay={180}>
          <TrendArea data={stats.trend} primaryLabel="В эфире (накопительно)" secondaryLabel="Черновики" />
        </Panel>
        <Panel title="Статусы" delay={220}>
          <StatusDonut
            slices={[
              { name: "В эфире", value: stats.published, color: "#ea580c" },
              { name: "Черновики", value: stats.drafts, color: "#0ea5e9" },
            ]}
            centerValue={items.length}
            centerLabel="на странице"
          />
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-orange-600" /> В эфире
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-sky-500" /> Черновики
            </span>
          </div>
        </Panel>
      </div>

      {actionError ? <Notice>{actionError}</Notice> : null}
      {quizzes.isError ? <Notice>{errorMessage(quizzes.error, "Не удалось загрузить викторины")}</Notice> : null}

      <Panel title="Все викторины" delay={280}>
        {quizzes.isLoading ? <p className="text-sm text-stone-500">Загрузка…</p> : null}
        {quizzes.data ? (
          <QuizTable
            quizzes={quizzes.data.items}
            canEdit={canEdit}
            onDelete={(quiz) => {
              if (window.confirm(`Удалить «${quiz.title}»?`)) remove.mutate(quiz);
            }}
          />
        ) : null}
        {total > limit ? (
          <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
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
      </Panel>
    </div>
  );
}
