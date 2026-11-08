import { Link, useNavigate } from "@tanstack/react-router";

import { LoginForm } from "@features/login";
import { AuthFrame } from "@widgets/auth-frame";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthFrame title="Вход">
      <LoginForm onSuccess={() => void navigate({ to: "/quizzes" })} />
      <p className="mt-6 text-sm text-stone-600">
        Нет аккаунта?{" "}
        <Link to="/register" className="font-medium text-stone-950 underline">
          Создать
        </Link>
      </p>
    </AuthFrame>
  );
}
