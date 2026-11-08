import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { RegisterForm } from "@features/register";
import { AuthFrame } from "@widgets/auth-frame";

export function RegisterPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthFrame title="Регистрация">
      {sent ? (
        <p className="text-sm leading-6 text-stone-700">
          Письмо со ссылкой отправлено. Откройте его и подтвердите почту, затем можно входить. Пока почтовый сервер не
          подключён, ссылка пишется в лог API.
        </p>
      ) : (
        <RegisterForm onSuccess={() => setSent(true)} />
      )}
      <p className="mt-6 text-sm text-stone-600">
        Уже есть аккаунт?{" "}
        <Link to="/login" className="font-medium text-stone-950 underline">
          Войти
        </Link>
      </p>
    </AuthFrame>
  );
}
