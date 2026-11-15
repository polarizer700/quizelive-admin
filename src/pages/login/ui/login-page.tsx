import { Link, useNavigate } from "@tanstack/react-router";

import { LoginForm } from "@features/login";
import { legal } from "@shared/config/legal";
import { AuthFrame } from "@widgets/auth-frame";
import { LegalLinks } from "@widgets/legal-links";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthFrame title="Вход">
      <LoginForm onSuccess={() => void navigate({ to: "/dashboard" })} />
      <p className="mt-6 text-sm text-stone-600">
        Нет аккаунта?{" "}
        <Link to="/register" className="font-medium text-stone-950 underline">
          Создать
        </Link>
      </p>
      <p className="mt-4 text-sm text-stone-600">
        Входя, вы продолжаете пользоваться сервисом по{" "}
        <a className="font-medium text-stone-950 underline" href={legal.privacyUrl} target="_blank" rel="noreferrer">
          политике конфиденциальности
        </a>
        .
      </p>
      <LegalLinks className="mt-6" />
    </AuthFrame>
  );
}
