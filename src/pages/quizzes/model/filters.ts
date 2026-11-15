import { useEffect, useState } from "react";

export type QuizFiltersValue = {
  q: string;
  status: string;
  game_type: string;
};

export const emptyQuizFilters: QuizFiltersValue = { q: "", status: "", game_type: "" };

export function useDebouncedValue(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
