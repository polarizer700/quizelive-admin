import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { register } from "@entities/session";
import { ApiError } from "@shared/api";
import { legal } from "@shared/config/legal";
import { Button, FieldError, Input, Label, Notice } from "@shared/ui";

import { registerSchema, type RegisterValues } from "../model/schema";

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState("");
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", consent: false as unknown as true },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError("");
    try {
      await register({ email: values.email, password: values.password });
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError && error.message === "email already exists") {
        setFormError("Эта почта уже зарегистрирована");
        return;
      }
      setFormError(error instanceof ApiError ? error.message : "Не удалось создать аккаунт");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      {formError ? <Notice>{formError}</Notice> : null}
      <div>
        <Label htmlFor="register-email">Почта</Label>
        <Input id="register-email" autoComplete="email" type="email" {...form.register("email")} />
        <FieldError>{form.formState.errors.email?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="register-password">Пароль</Label>
        <Input id="register-password" autoComplete="new-password" type="password" {...form.register("password")} />
        <FieldError>{form.formState.errors.password?.message}</FieldError>
      </div>
      <label className="flex items-start gap-3 text-sm leading-5 text-stone-700">
        <input className="mt-1" type="checkbox" {...form.register("consent")} />
        <span>
          Соглашаюсь на обработку персональных данных по{" "}
          <a className="font-medium text-stone-950 underline" href={legal.privacyUrl} target="_blank" rel="noreferrer">
            политике конфиденциальности
          </a>
        </span>
      </label>
      <FieldError>{form.formState.errors.consent?.message}</FieldError>
      <Button className="mt-2" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Отправляем…" : "Создать аккаунт"}
      </Button>
    </form>
  );
}
