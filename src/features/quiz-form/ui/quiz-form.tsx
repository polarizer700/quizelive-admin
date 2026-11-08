import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { statusLabel } from "@entities/session";
import { ApiError } from "@shared/api";
import { Button, FieldError, Input, Label, Notice, Select, Textarea } from "@shared/ui";

import { quizSchema, type QuizValues } from "../model/schema";

export function QuizForm({
  initial,
  includeStatus = false,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<QuizValues>;
  includeStatus?: boolean;
  submitLabel: string;
  onSubmit: (values: QuizValues) => Promise<void>;
}) {
  const [formError, setFormError] = useState("");
  const form = useForm<QuizValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      status: initial?.status ?? "draft",
    },
  });

  async function submit(values: QuizValues) {
    setFormError("");
    try {
      await onSubmit(values);
      if (!includeStatus) form.reset({ title: "", description: "", status: "draft" });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        for (const [field, message] of Object.entries(error.fields)) {
          if (field === "title" || field === "description" || field === "status") {
            form.setError(field, { message });
          }
        }
        return;
      }
      setFormError("Не удалось сохранить викторину");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(submit)}>
      {formError ? <Notice>{formError}</Notice> : null}
      <div>
        <Label htmlFor="quiz-title">Название</Label>
        <Input id="quiz-title" {...form.register("title")} />
        <FieldError>{form.formState.errors.title?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="quiz-description">Описание</Label>
        <Textarea id="quiz-description" {...form.register("description")} />
        <FieldError>{form.formState.errors.description?.message}</FieldError>
      </div>
      {includeStatus ? (
        <div>
          <Label htmlFor="quiz-status">Статус</Label>
          <Select id="quiz-status" {...form.register("status")}>
            <option value="draft">{statusLabel.draft}</option>
            <option value="published">{statusLabel.published}</option>
          </Select>
        </div>
      ) : null}
      <div>
        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Сохраняем…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
