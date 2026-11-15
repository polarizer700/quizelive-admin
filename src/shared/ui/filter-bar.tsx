import { ListFilter, X } from "lucide-react";

import { optionLabel, type ActiveFilters, type FilterDef } from "@shared/lib/filters";

import { Button } from "./button";
import { Input } from "./field";

/**
 * Панель над списком: строка поиска, чипы активных фильтров
 * и кнопка открытия drawer со всеми фильтрами.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Поиск",
  searchLabel = "Поиск",
  defs,
  values,
  onAddClick,
  onChipClick,
  onChipRemove,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  defs: FilterDef[];
  values: ActiveFilters;
  onAddClick: () => void;
  onChipClick: (key: string) => void;
  onChipRemove: (key: string) => void;
}) {
  const active = defs.filter((def) => (values[def.key]?.length ?? 0) > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <Input
            type="search"
            value={search}
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Button tone="ghost" className="shrink-0" onClick={onAddClick}>
          <ListFilter size={16} />
          Добавить фильтр
          {active.length > 0 ? (
            <span className="rounded-lg border-2 border-ink bg-acid px-1.5 py-0.5 font-mono text-xs font-bold">{active.length}</span>
          ) : null}
        </Button>
      </div>

      {active.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {active.map((def) => {
            const selected = values[def.key] ?? [];
            return (
              <span
                key={def.key}
                className="inline-flex max-w-full items-center gap-1.5 rounded-xl border-[3px] border-ink bg-acid px-3 py-1.5 text-sm font-bold text-ink shadow-[3px_3px_0_#111]"
              >
                <button type="button" className="min-w-0 truncate hover:underline" onClick={() => onChipClick(def.key)}>
                  {def.label}: {selected.map((value) => optionLabel(def, value)).join(", ")}
                </button>
                <button
                  type="button"
                  aria-label={`Убрать фильтр «${def.label}»`}
                  className="shrink-0 text-stone-600 transition hover:text-pink"
                  onClick={() => onChipRemove(def.key)}
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
