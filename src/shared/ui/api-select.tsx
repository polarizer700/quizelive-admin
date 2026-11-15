import { useEffect, useRef, useState } from "react";

import { cn } from "@shared/lib/cn";

import { Input } from "./field";

/**
 * Переиспользуемый селект с подгрузкой вариантов по API:
 * свободный ввод + выпадающий список с поиском. Подходит под любую
 * сущность — источник данных приходит через loadOptions.
 */
export function ApiSelect({
  id,
  value,
  onChange,
  loadOptions,
  placeholder,
  emptyLabel = "Ничего не найдено — сохранится как новое",
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  loadOptions: (query: string) => Promise<string[]>;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  // Подгружаем варианты с дебаунсом, пока список открыт
  useEffect(() => {
    if (!open) return undefined;
    const ticket = ++requestRef.current;
    const timer = window.setTimeout(() => {
      setLoading(true);
      loadOptions(value.trim())
        .then((items) => {
          if (requestRef.current === ticket) {
            setOptions(items);
            setHighlight(0);
          }
        })
        .catch(() => {
          if (requestRef.current === ticket) setOptions([]);
        })
        .finally(() => {
          if (requestRef.current === ticket) setLoading(false);
        });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open, value, loadOptions]);

  // Закрытие по клику вне и по Escape
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function pick(option: string) {
    onChange(option);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        aria-expanded={open}
        role="combobox"
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setHighlight((current) => Math.min(current + 1, options.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlight((current) => Math.max(current - 1, 0));
          } else if (event.key === "Enter" && open && options[highlight]) {
            event.preventDefault();
            pick(options[highlight]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open ? (
        <div className="absolute z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border-[3px] border-ink bg-white shadow-[4px_4px_0_#111]">
          {loading ? <p className="px-3 py-2 text-sm text-stone-500">Ищем…</p> : null}
          {!loading && options.length === 0 ? <p className="px-3 py-2 text-sm text-stone-500">{emptyLabel}</p> : null}
          {!loading &&
            options.map((option, index) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm font-bold text-ink transition hover:bg-acid",
                  index === highlight && "bg-acid",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(option)}
              >
                {option}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
