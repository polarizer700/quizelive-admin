import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { roleLabel } from "@entities/session";
import { ApiError } from "@shared/api";
import { Button, FieldError, Input, Label, Notice, Select } from "@shared/ui";

import { userSchema, type UserValues } from "../model/schema";

export function UserForm({ onSubmit }: { onSubmit: (values: UserValues) => Promise<void> }) {
  const [formError, setFormError] = useState("");
  const form = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { email: "", password: "", role: "editor" },
  });

  async function submit(values: UserValues) {
    setFormError("");
    try {
      await onSubmit(values);
      form.reset({ email: "", password: "", role: "editor" });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        for (const [field, message] of Object.entries(error.fields)) {
          if (field === "email" || field === "password" || field === "role") form.setError(field, { message });
        }
        return;
      }
      setFormError("Не удалось создать пользователя");
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-[1fr_1fr_180px_auto] md:items-end" onSubmit={form.handleSubmit(submit)}>
      {formError ? (
        <div className="md:col-span-4">
          <Notice>{formError}</Notice>
        </div>
      ) : null}
      <div>
        <Label htmlFor="user-email">Почта</Label>
        <Input id="user-email" type="email" autoComplete="off" {...form.register("email")} />
        <FieldError>{form.formState.errors.email?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="user-password">Пароль</Label>
        <Input id="user-password" type="password" autoComplete="new-password" {...form.register("password")} />
        <FieldError>{form.formState.errors.password?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="user-role">Роль</Label>
        <Select id="user-role" {...form.register("role")}>
          <option value="admin">{roleLabel.admin}</option>
          <option value="editor">{roleLabel.editor}</option>
          <option value="host">{roleLabel.host}</option>
        </Select>
      </div>
      <Button disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Создаём…" : "Создать"}
      </Button>
    </form>
  );
}
