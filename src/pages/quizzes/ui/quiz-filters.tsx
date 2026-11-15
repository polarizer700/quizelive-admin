import { useState } from "react";

import { FilterBar, FilterDrawer } from "@shared/ui";

import type { useQuizFilters } from "../model/filters";

export function QuizFilters({ filters }: { filters: ReturnType<typeof useQuizFilters> }) {
  const [open, setOpen] = useState(false);
  const [initialKey, setInitialKey] = useState<string | null>(null);

  function openDrawer(key: string | null) {
    setInitialKey(key);
    setOpen(true);
  }

  return (
    <>
      <FilterBar
        search={filters.q}
        searchPlaceholder="Поиск по названию или описанию"
        searchLabel="Поиск игр"
        defs={filters.defs}
        values={filters.values}
        onSearchChange={filters.setQ}
        onAddClick={() => openDrawer(null)}
        onChipClick={openDrawer}
        onChipRemove={filters.clearValues}
      />
      <FilterDrawer
        open={open}
        defs={filters.defs}
        values={filters.values}
        initialKey={initialKey}
        onToggle={filters.toggleValue}
        onClear={filters.clearValues}
        onClearAll={filters.clearAll}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
