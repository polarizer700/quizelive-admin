import { useEffect, useState } from "react";

import { legal } from "@shared/config/legal";

const STORAGE_KEY = "quizelive.cookieConsent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "accepted");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-stone-950 px-4 py-3 text-sm text-stone-50 shadow-2xl">
      <p className="max-w-md leading-5 text-stone-200">
        Используем необходимые cookie. Подробности в{" "}
        <a className="text-orange-300 underline" href={legal.cookiesUrl} target="_blank" rel="noreferrer">
          пояснении
        </a>{" "}
        и{" "}
        <a className="text-orange-300 underline" href={legal.privacyUrl} target="_blank" rel="noreferrer">
          политике
        </a>
        .
      </p>
      <button
        className="rounded-xl bg-orange-500 px-3 py-2 font-medium text-stone-950"
        type="button"
        onClick={() => {
          try {
            window.localStorage.setItem(STORAGE_KEY, "accepted");
          } catch {
            // ignore
          }
          setVisible(false);
        }}
      >
        Принять
      </button>
    </div>
  );
}
