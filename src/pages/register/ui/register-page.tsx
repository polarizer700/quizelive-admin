import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { RegisterForm } from "@features/register";
import { AuthFrame } from "@widgets/auth-frame";
import { LegalLinks } from "@widgets/legal-links";

export function RegisterPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthFrame title="Регистрация">
      {sent ? (
        <p className="text-sm leading-6 text-stone-700">
          Письмо со ссылкой отправлено на вашу почту. Откройте его, подтвердите адрес — после этого можно входить.
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
      <LegalLinks className="mt-6" />
    </AuthFrame>
  );
}
