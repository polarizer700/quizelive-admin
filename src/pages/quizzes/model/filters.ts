import { useEffect, useMemo, useState } from "react";

import { listCategories } from "@entities/question";
import type { Quiz, QuizStatus } from "@entities/quiz";
import { gameTypeLabel, statusLabel } from "@entities/session";
import { useUrlFilters, type FilterDef } from "@shared/lib/filters";

export function useDebouncedValue(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function quizFilterDefs(withStatus: boolean): FilterDef[] {
  const defs: FilterDef[] = [];
  if (withStatus) {
    defs.push({
      key: "status",
      label: "Статус",
      options: Object.entries(statusLabel).map(([value, label]) => ({ value, label })),
    });
  }
  defs.push({
    key: "game_type",
    label: "Тип игры",
    options: Object.entries(gameTypeLabel).map(([value, label]) => ({ value, label })),
  });
  defs.push({
    key: "category",
    label: "Категория вопросов",
    loadOptions: async (query) => {
      const categories = await listCategories(query);
      return categories.map((category) => ({ value: category, label: category }));
    },
  });
  return defs;
}

/**
 * Фильтры списка игр: живут в URL, типизированный query для API.
 * withStatus — фильтр по статусу есть только на вкладке «Мои».
 */
export function useQuizFilters(withStatus: boolean) {
  const defs = useMemo(() => quizFilterDefs(withStatus), [withStatus]);
  const urlFilters = useUrlFilters();

  const query = useMemo(
    () => ({
      status: (urlFilters.values.status ?? []) as QuizStatus[],
      game_type: (urlFilters.values.game_type ?? []) as Quiz["game_type"][],
      category: urlFilters.values.category ?? [],
    }),
    [urlFilters.values],
  );

  return { ...urlFilters, defs, query };
}
