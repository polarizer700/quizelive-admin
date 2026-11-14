import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { verifyEmail } from "@entities/session";
import { ApiError } from "@shared/api";
import { AuthFrame } from "@widgets/auth-frame";

export function VerifyEmailPage() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [state, setState] = useState<"pending" | "done" | "failed">(token ? "pending" : "failed");
  const [message, setMessage] = useState(
    token ? "Проверяем ссылку…" : "В ссылке нет кода подтверждения.",
  );

  useEffect(() => {
    if (!token) return;

    let active = true;
    verifyEmail(token)
      .then(() => {
        if (!active) return;
        setState("done");
        setMessage("Почта подтверждена. Теперь можно войти.");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState("failed");
        setMessage(error instanceof ApiError ? "Ссылка недействительна или устарела." : "Не удалось подтвердить почту.");
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthFrame title="Подтверждение">
      <p className="text-sm leading-6 text-stone-700">{message}</p>
      {state !== "pending" ? (
        <p className="mt-6 text-sm">
          <Link to="/login" className="font-medium text-stone-950 underline">
            Ко входу
          </Link>
        </p>
      ) : null}
    </AuthFrame>
  );
}
