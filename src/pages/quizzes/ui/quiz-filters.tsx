import { gameTypeLabel, statusLabel } from "@entities/session";
import { Input, Select } from "@shared/ui";

import type { QuizFiltersValue } from "../model/filters";

export function QuizFilters({
  value,
  onChange,
  withStatus = false,
}: {
  value: QuizFiltersValue;
  onChange: (next: QuizFiltersValue) => void;
  withStatus?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
      <Input
        type="search"
        value={value.q}
        placeholder="Поиск по названию или описанию"
        aria-label="Поиск игр"
        onChange={(event) => onChange({ ...value, q: event.target.value })}
      />
      {withStatus ? (
        <Select
          value={value.status}
          aria-label="Фильтр по статусу"
          onChange={(event) => onChange({ ...value, status: event.target.value })}
        >
          <option value="">Все статусы</option>
          {Object.entries(statusLabel).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </Select>
      ) : null}
      <Select
        value={value.game_type}
        aria-label="Фильтр по типу игры"
        onChange={(event) => onChange({ ...value, game_type: event.target.value })}
      >
        <option value="">Все типы игр</option>
        {Object.entries(gameTypeLabel).map(([type, label]) => (
          <option key={type} value={type}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
