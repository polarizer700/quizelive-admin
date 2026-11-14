import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { forgotPassword } from "@entities/session";
import { ApiError } from "@shared/api";
import { Button, FieldError, Input, Label, Notice } from "@shared/ui";

import { forgotPasswordSchema, type ForgotPasswordValues } from "../model/schema";

export function ForgotPasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState("");
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError("");
    try {
      await forgotPassword(values.email);
      onSuccess();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Не удалось отправить письмо");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      {formError ? <Notice>{formError}</Notice> : null}
      <div>
        <Label htmlFor="forgot-email">Почта</Label>
        <Input id="forgot-email" autoComplete="email" type="email" {...form.register("email")} />
        <FieldError>{form.formState.errors.email?.message}</FieldError>
      </div>
      <Button className="mt-2" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Отправляем…" : "Отправить ссылку"}
      </Button>
    </form>
  );
}
