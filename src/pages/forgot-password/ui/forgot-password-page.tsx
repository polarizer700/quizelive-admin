import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { ForgotPasswordForm } from "@features/forgot-password";
import { AuthFrame } from "@widgets/auth-frame";
import { LegalLinks } from "@widgets/legal-links";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthFrame title="Сброс пароля">
      {sent ? (
        <p className="text-sm leading-6 text-stone-700">
          Если аккаунт с этой почтой есть, мы отправили ссылку для сброса. Проверьте входящие и папку «Спам».
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm leading-6 text-stone-600">
            Укажите почту аккаунта — пришлём ссылку, по которой можно задать новый пароль.
          </p>
          <ForgotPasswordForm onSuccess={() => setSent(true)} />
        </>
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
