import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { resetPassword } from "@entities/session";
import { ApiError } from "@shared/api";
import { Button, FieldError, Input, Label, Notice, PasswordHints } from "@shared/ui";

import { resetPasswordSchema, type ResetPasswordValues } from "../model/schema";

export function ResetPasswordForm({ token, onSuccess }: { token: string; onSuccess: () => void }) {
  const [formError, setFormError] = useState("");
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onChange",
  });
  const password = form.watch("password");

  async function onSubmit(values: ResetPasswordValues) {
    setFormError("");
    try {
      await resetPassword({ token, password: values.password });
      onSuccess();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? "Ссылка недействительна или устарела." : "Не удалось сохранить пароль",
      );
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      {formError ? <Notice>{formError}</Notice> : null}
      <div>
        <Label htmlFor="reset-password">Новый пароль</Label>
        <Input id="reset-password" autoComplete="new-password" type="password" {...form.register("password")} />
        <PasswordHints password={password} />
        <FieldError>{form.formState.errors.password?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="reset-confirm">Ещё раз</Label>
        <Input id="reset-confirm" autoComplete="new-password" type="password" {...form.register("confirm")} />
        <FieldError>{form.formState.errors.confirm?.message}</FieldError>
      </div>
      <Button className="mt-2" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Сохраняем…" : "Сохранить пароль"}
      </Button>
    </form>
  );
}
