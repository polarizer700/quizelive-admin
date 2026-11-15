import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { gameTypeLabel, statusLabel } from "@entities/session";
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
      game_type: initial?.game_type ?? "quiz",
      break_after_round: initial?.break_after_round ?? 0,
    },
  });
  const gameType = useWatch({ control: form.control, name: "game_type" });

  async function submit(values: QuizValues) {
    setFormError("");
    try {
      await onSubmit(values);
      if (!includeStatus) {
        form.reset({ title: "", description: "", status: "draft", game_type: "quiz", break_after_round: 0 });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        for (const [field, message] of Object.entries(error.fields)) {
          if (field === "title" || field === "description" || field === "status") {
            form.setError(field, { message });
          } else if (field === "game_type" || field === "break_after_round") {
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
      <div>
        <Label htmlFor="quiz-game-type">Тип игры</Label>
        <Select id="quiz-game-type" {...form.register("game_type")}>
          <option value="quiz">{gameTypeLabel.quiz}</option>
          <option value="pub_quiz">{gameTypeLabel.pub_quiz}</option>
          <option value="jeopardy">{gameTypeLabel.jeopardy}</option>
        </Select>
        <FieldError>{form.formState.errors.game_type?.message}</FieldError>
        <p className="mt-1 text-xs text-stone-400">
          Квиз и своя игра группируют вопросы в раунды по категориям.
        </p>
      </div>
      {gameType === "pub_quiz" ? (
        <div>
          <Label htmlFor="quiz-break">Перерыв после раунда</Label>
          <Input
            id="quiz-break"
            min={0}
            max={10}
            type="number"
            {...form.register("break_after_round", { valueAsNumber: true })}
          />
          <FieldError>{form.formState.errors.break_after_round?.message}</FieldError>
          <p className="mt-1 text-xs text-stone-400">
            0 — без перерыва. Обычно делают паузу между 3 и 6 раундом.
          </p>
        </div>
      ) : null}
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
