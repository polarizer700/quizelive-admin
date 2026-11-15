import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FileText, Plus, Radio, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { canEditQuizzes, useSessionStore } from "@entities/session";
import { listQuizzes, quizKeys, type Quiz } from "@entities/quiz";
import { Panel, StatCard, StatusDonut, TrendArea } from "@shared/ui";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

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

export function DashboardPage() {
  const user = useSessionStore((state) => state.user);
  const role = user?.role;
  const canEdit = canEditQuizzes(role);
  const quizzes = useQuery({
    queryKey: quizKeys.list({ limit: 100, offset: 0 }),
    queryFn: () => listQuizzes({ limit: 100, offset: 0 }),
  });

  const items = useMemo(() => quizzes.data?.items ?? [], [quizzes.data]);
  const stats = useMemo(() => {
    const published = items.filter((quiz) => quiz.status === "published").length;
    const drafts = items.filter((quiz) => quiz.status === "draft").length;
    const spark = items.map((_, index) => index + 1);
    const trend = buildTrend(items);
    return { published, drafts, spark, trend };
  }, [items]);

  const name = user?.email?.split("@")[0] ?? "студия";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cobalt">Студия</p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-none tracking-tight text-ink md:text-4xl">
            {greeting()}, {name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Статистика по играм. Витрина — во вкладке «Игры».
          </p>
        </div>
        {canEdit ? (
          <Link
            to="/quizzes/new"
            className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-acid px-4 py-2.5 text-sm font-bold text-ink shadow-[4px_4px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111]"
          >
            <Plus size={16} />
            Новая игра
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Всего"
          value={quizzes.data?.total ?? 0}
          hint="игр в студии"
          icon={<Sparkles size={18} />}
          delay={40}
          sparkline={stats.spark.length > 1 ? stats.spark : [0, items.length || 1]}
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
              { name: "В эфире", value: stats.published, color: "#2b4bff" },
              { name: "Черновики", value: stats.drafts, color: "#ff5da2" },
            ]}
            centerValue={items.length}
            centerLabel="на странице"
          />
          <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs font-bold uppercase text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-ink bg-cobalt" /> В эфире
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full border border-ink bg-pink" /> Черновики
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
