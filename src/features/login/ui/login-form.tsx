import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { login } from "@entities/session";
import { ApiError } from "@shared/api";
import { Button, FieldError, Input, Label, Notice } from "@shared/ui";

import { loginSchema, type LoginValues } from "../model/schema";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState("");
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError("");
    try {
      await login(values);
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError && error.slug === "EMAIL_NOT_VERIFIED") {
        setFormError("Аккаунт ещё не подтверждён. Мы отправили новое письмо со ссылкой — откройте его и подтвердите почту.");
        return;
      }
      setFormError(error instanceof ApiError ? error.message : "Не удалось войти");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      {formError ? <Notice>{formError}</Notice> : null}
      <div>
        <Label htmlFor="email">Почта</Label>
        <Input id="email" autoComplete="username" type="email" {...form.register("email")} />
        <FieldError>{form.formState.errors.email?.message}</FieldError>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-3">
          <Label htmlFor="password">Пароль</Label>
          <Link to="/forgot-password" className="text-xs font-medium text-orange-700 hover:underline">
            Забыли пароль?
          </Link>
        </div>
        <Input id="password" autoComplete="current-password" type="password" {...form.register("password")} />
        <FieldError>{form.formState.errors.password?.message}</FieldError>
      </div>
      <Button className="mt-2" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Входим…" : "Войти"}
      </Button>
    </form>
  );
}
