import { ArrowLeft, Check, ChevronRight, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@shared/lib/cn";
import { optionLabel, type ActiveFilters, type FilterDef, type FilterOption } from "@shared/lib/filters";

import { Input } from "./field";

/**
 * Выдвижная панель со всеми фильтрами списка: поиск по фильтрам,
 * выбор фильтра, мульти-выбор значений. Значения некоторых фильтров
 * подгружаются по API (loadOptions в FilterDef).
 */
export function FilterDrawer({
  open,
  defs,
  values,
  initialKey = null,
  onToggle,
  onClear,
  onClearAll,
  onClose,
}: {
  open: boolean;
  defs: FilterDef[];
  values: ActiveFilters;
  initialKey?: string | null;
  onToggle: (key: string, value: string) => void;
  onClear: (key: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(open ? initialKey : null);
  const [query, setQuery] = useState("");

  // При каждом открытии возвращаемся к списку (или к конкретному фильтру) —
  // подстройка при рендере, без эффекта
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setSelectedKey(initialKey);
      setQuery("");
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const selected = defs.find((def) => def.key === selectedKey) ?? null;
  const activeCount = Object.values(values).filter((list) => list.length > 0).length;
  const needle = query.trim().toLowerCase();
  const visible = needle ? defs.filter((def) => def.label.toLowerCase().includes(needle)) : defs;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label="Фильтры"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l-[3px] border-ink bg-paper"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b-[3px] border-ink px-4 py-3">
              <h2 className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-ink">Фильтры</h2>
              <button
                type="button"
                aria-label="Закрыть фильтры"
                className="rounded-lg border-[3px] border-ink bg-white p-1.5 text-ink shadow-[2px_2px_0_#111] transition hover:bg-acid"
                onClick={onClose}
              >
                <X size={16} />
              </button>
            </div>

            {selected ? (
              <FilterValues
                def={selected}
                values={values[selected.key] ?? []}
                onBack={() => setSelectedKey(null)}
                onToggle={(value) => onToggle(selected.key, value)}
                onClear={() => onClear(selected.key)}
              />
            ) : (
              <>
                <div className="border-b-[3px] border-ink px-4 py-3">
                  <Input
                    type="search"
                    value={query}
                    placeholder="Найти фильтр"
                    aria-label="Найти фильтр"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {visible.length === 0 ? <p className="px-2 py-3 text-sm text-stone-500">Ничего не найдено.</p> : null}
                  <div className="flex flex-col gap-2">
                    {visible.map((def) => (
                      <FilterRow key={def.key} def={def} values={values[def.key] ?? []} onClick={() => setSelectedKey(def.key)} />
                    ))}
                  </div>
                </div>
                {activeCount > 0 ? (
                  <div className="border-t-[3px] border-ink px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stone-600 transition hover:text-pink"
                      onClick={onClearAll}
                    >
                      <RotateCcw size={14} />
                      Сбросить все фильтры
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function FilterRow({ def, values, onClick }: { def: FilterDef; values: string[]; onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex items-center justify-between gap-3 rounded-xl border-[3px] border-ink bg-white px-3.5 py-3 text-left shadow-[3px_3px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-acid hover:shadow-[5px_5px_0_#111]"
      onClick={onClick}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">{def.label}</span>
        {values.length > 0 ? (
          <span className="mt-0.5 block truncate font-mono text-xs text-stone-500">
            {values.map((value) => optionLabel(def, value)).join(", ")}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {values.length > 0 ? (
          <span className="rounded-lg border-2 border-ink bg-acid px-1.5 py-0.5 font-mono text-xs font-bold">{values.length}</span>
        ) : null}
        <ChevronRight size={16} className="text-stone-500" />
      </span>
    </button>
  );
}

function FilterValues({
  def,
  values,
  onBack,
  onToggle,
  onClear,
}: {
  def: FilterDef;
  values: string[];
  onBack: () => void;
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 border-b-[3px] border-ink px-4 py-3">
        <button
          type="button"
          aria-label="Назад к списку фильтров"
          className="rounded-lg border-[3px] border-ink bg-white p-1.5 text-ink shadow-[2px_2px_0_#111] transition hover:bg-acid"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
        </button>
        <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{def.label}</h3>
        {values.length > 0 ? (
          <button
            type="button"
            className="shrink-0 font-mono text-xs font-bold uppercase tracking-wide text-stone-500 transition hover:text-pink"
            onClick={onClear}
          >
            Сбросить
          </button>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {def.loadOptions ? (
          <AsyncOptions loadOptions={def.loadOptions} values={values} onToggle={onToggle} />
        ) : (
          <div className="flex flex-col gap-2">
            {(def.options ?? []).map((option) => (
              <OptionRow key={option.value} option={option} selected={values.includes(option.value)} onToggle={onToggle} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function OptionRow({ option, selected, onToggle }: { option: FilterOption; selected: boolean; onToggle: (value: string) => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border-[3px] border-ink px-3.5 py-2.5 text-left text-sm font-bold shadow-[3px_3px_0_#111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]",
        selected ? "bg-acid text-ink" : "bg-white text-ink hover:bg-acid/50",
      )}
      onClick={() => onToggle(option.value)}
    >
      <span className="min-w-0 truncate">{option.label}</span>
      {selected ? <Check size={16} className="shrink-0" /> : null}
    </button>
  );
}

function AsyncOptions({
  loadOptions,
  values,
  onToggle,
}: {
  loadOptions: (query: string) => Promise<FilterOption[]>;
  values: string[];
  onToggle: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const ticket = ++requestRef.current;
    const timer = window.setTimeout(() => {
      setLoading(true);
      loadOptions(query.trim())
        .then((items) => {
          if (requestRef.current === ticket) setOptions(items);
        })
        .catch(() => {
          if (requestRef.current === ticket) setOptions([]);
        })
        .finally(() => {
          if (requestRef.current === ticket) setLoading(false);
        });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, loadOptions]);

  // Выбранные значения показываем чипами — их может не быть среди подгруженных
  const loaded = new Set(options.map((option) => option.value));
  const missing = values.filter((value) => !loaded.has(value));

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        value={query}
        placeholder="Начните вводить…"
        aria-label="Поиск значений"
        onChange={(event) => setQuery(event.target.value)}
      />
      {missing.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {missing.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-lg border-[3px] border-ink bg-acid px-2 py-1 text-xs font-bold text-ink"
            >
              {value}
              <button type="button" aria-label={`Убрать ${value}`} className="text-stone-600 hover:text-pink" onClick={() => onToggle(value)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {loading ? <p className="px-1 py-2 text-sm text-stone-500">Ищем…</p> : null}
      {!loading && options.length === 0 ? <p className="px-1 py-2 text-sm text-stone-500">Ничего не найдено.</p> : null}
      <div className="flex flex-col gap-2">
        {!loading
          ? options.map((option) => (
              <OptionRow key={option.value} option={option} selected={values.includes(option.value)} onToggle={onToggle} />
            ))
          : null}
      </div>
    </div>
  );
}
