import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { ResetPasswordForm } from "@features/reset-password";
import { AuthFrame } from "@widgets/auth-frame";
import { LegalLinks } from "@widgets/legal-links";

export function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [done, setDone] = useState(false);

  return (
    <AuthFrame title="Новый пароль">
      {!token ? (
        <p className="text-sm leading-6 text-stone-700">В ссылке нет кода сброса. Запросите письмо ещё раз.</p>
      ) : done ? (
        <p className="text-sm leading-6 text-stone-700">Пароль обновлён. Теперь можно войти.</p>
      ) : (
        <ResetPasswordForm token={token} onSuccess={() => setDone(true)} />
      )}
      <p className="mt-6 text-sm text-stone-600">
        <Link to="/login" className="font-medium text-stone-950 underline">
          Ко входу
        </Link>
      </p>
      <LegalLinks className="mt-6" />
    </AuthFrame>
  );
}
