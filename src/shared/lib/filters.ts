import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

export type FilterOption = {
  value: string;
  label: string;
};

/**
 * Описание фильтра списка. Значения всегда мульти-выбор:
 * статичный список (options) или подгрузка по API (loadOptions).
 */
export type FilterDef = {
  key: string;
  label: string;
  options?: FilterOption[];
  loadOptions?: (query: string) => Promise<FilterOption[]>;
};

export type ActiveFilters = Record<string, string[]>;

function parseValues(raw: unknown): string[] {
  if (typeof raw !== "string" || raw === "") return [];
  return raw.split(",").filter(Boolean);
}

/**
 * Состояние фильтров списка в search-параметрах URL — ссылкой на
 * отфильтрованный список можно делиться. Значения одного фильтра
 * складываются в параметр через запятую: ?status=draft,published
 */
export function useUrlFilters() {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();

  const q = typeof search.q === "string" ? search.q : "";

  const values = useMemo(() => {
    const result: ActiveFilters = {};
    for (const [key, raw] of Object.entries(search)) {
      if (key === "q") continue;
      const parsed = parseValues(raw);
      if (parsed.length > 0) result[key] = parsed;
    }
    return result;
  }, [search]);

  const apply = useCallback(
    (nextQ: string, nextValues: ActiveFilters, replace = false) => {
      void navigate({
        to: ".",
        replace,
        search: {
          ...(nextQ ? { q: nextQ } : {}),
          ...Object.fromEntries(
            Object.entries(nextValues)
              .filter(([, list]) => list.length > 0)
              .map(([key, list]) => [key, list.join(",")]),
          ),
        },
      });
    },
    [navigate],
  );

  // Поиск пишем с replace, чтобы каждый символ не плодил записи в истории
  const setQ = useCallback((next: string) => apply(next, values, true), [apply, values]);

  const setValues = useCallback(
    (key: string, list: string[]) => apply(q, { ...values, [key]: list }),
    [apply, q, values],
  );

  const toggleValue = useCallback(
    (key: string, value: string) => {
      const current = values[key] ?? [];
      setValues(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    },
    [setValues, values],
  );

  const clearValues = useCallback((key: string) => setValues(key, []), [setValues]);

  const clearAll = useCallback(() => apply("", {}), [apply]);

  return { q, setQ, values, setValues, toggleValue, clearValues, clearAll };
}

export function optionLabel(def: FilterDef | undefined, value: string): string {
  return def?.options?.find((option) => option.value === value)?.label ?? value;
}
