import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import type { Question, QuestionInput } from "@entities/question";
import { questionTypeLabel } from "@entities/session";
import { ApiError } from "@shared/api";
import { Button, FieldError, Input, Label, Notice, Select, Textarea } from "@shared/ui";

import { emptyQuestion, questionSchema, type QuestionValues } from "../model/schema";

function toValues(question: Question): QuestionValues {
  return {
    type: question.type,
    text: question.text,
    time_limit_sec: question.time_limit_sec,
    points: question.points,
    options:
      question.options.length > 0
        ? question.options.map((option) => ({ text: option.text, is_correct: option.is_correct }))
        : emptyQuestion.options,
    text_answers: question.text_answers.length > 0 ? question.text_answers : [""],
  };
}

function toPayload(values: QuestionValues): QuestionInput {
  const base = {
    type: values.type,
    text: values.text.trim(),
    time_limit_sec: values.time_limit_sec,
    points: values.points,
  };

  if (values.type === "text") {
    return {
      ...base,
      options: [],
      text_answers: values.text_answers.map((item) => item.trim()).filter(Boolean),
    };
  }

  return {
    ...base,
    options: values.options.map((option) => ({ text: option.text.trim(), is_correct: option.is_correct })),
    text_answers: [],
  };
}

function listMessage(error: { message?: string; root?: { message?: string } } | undefined) {
  return error?.message || error?.root?.message;
}

export function QuestionForm({
  question,
  onSubmit,
  onDelete,
}: {
  question: Question | null;
  onSubmit: (body: QuestionInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [formError, setFormError] = useState("");
  const form = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: question ? toValues(question) : emptyQuestion,
  });
  const options = useFieldArray({ control: form.control, name: "options" });
  const answers = useWatch({ control: form.control, name: "text_answers" });
  const type = useWatch({ control: form.control, name: "type" });
  const optionValues = useWatch({ control: form.control, name: "options" });

  useEffect(() => {
    form.reset(question ? toValues(question) : emptyQuestion);
  }, [form, question]);

  async function submit(values: QuestionValues) {
    setFormError("");
    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        for (const [field, message] of Object.entries(error.fields)) {
          if (field === "text" || field === "type" || field === "time_limit_sec" || field === "points" || field === "options" || field === "text_answers") {
            form.setError(field, { message });
          }
        }
        return;
      }
      setFormError("Не удалось сохранить вопрос");
    }
  }

  function setCorrect(index: number, checked: boolean) {
    if (type === "single") {
      options.fields.forEach((_, optionIndex) => {
        form.setValue(`options.${optionIndex}.is_correct`, optionIndex === index);
      });
      return;
    }
    form.setValue(`options.${index}.is_correct`, checked);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(submit)}>
      {formError ? <Notice>{formError}</Notice> : null}
      <div>
        <Label htmlFor="question-type">Тип</Label>
        <Select
          id="question-type"
          {...form.register("type")}
          onChange={(event) => {
            const next = event.target.value as QuestionValues["type"];
            form.setValue("type", next);
            if (next === "single") {
              let marked = false;
              options.fields.forEach((_, index) => {
                const correct = form.getValues(`options.${index}.is_correct`) && !marked;
                if (correct) marked = true;
                form.setValue(`options.${index}.is_correct`, correct);
              });
            }
          }}
        >
          <option value="single">{questionTypeLabel.single}</option>
          <option value="multiple">{questionTypeLabel.multiple}</option>
          <option value="text">{questionTypeLabel.text}</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="question-text">Вопрос</Label>
        <Textarea id="question-text" {...form.register("text")} />
        <FieldError>{form.formState.errors.text?.message}</FieldError>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="question-time">Секунды</Label>
          <Input id="question-time" min={5} max={300} type="number" {...form.register("time_limit_sec", { valueAsNumber: true })} />
          <FieldError>{form.formState.errors.time_limit_sec?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="question-points">Баллы</Label>
          <Input id="question-points" min={1} max={10000} type="number" {...form.register("points", { valueAsNumber: true })} />
          <FieldError>{form.formState.errors.points?.message}</FieldError>
        </div>
      </div>

      {type === "text" ? (
        <div className="flex flex-col gap-2">
          <Label>Правильные ответы</Label>
          {answers.map((answer, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={answer}
                placeholder="Ответ"
                onChange={(event) => {
                  const next = [...form.getValues("text_answers")];
                  next[index] = event.target.value;
                  form.setValue("text_answers", next);
                }}
              />
              <Button
                tone="ghost"
                disabled={answers.length === 1}
                onClick={() => {
                  const next = form.getValues("text_answers").filter((_, itemIndex) => itemIndex !== index);
                  form.setValue("text_answers", next.length > 0 ? next : [""]);
                }}
              >
                Убрать
              </Button>
            </div>
          ))}
          <FieldError>{listMessage(form.formState.errors.text_answers)}</FieldError>
          <div>
            <Button
              tone="ghost"
              disabled={answers.length >= 20}
              onClick={() => form.setValue("text_answers", [...form.getValues("text_answers"), ""])}
            >
              Ещё ответ
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label>Варианты</Label>
          {options.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <input
                className="mt-3"
                type={type === "single" ? "radio" : "checkbox"}
                name="correct-option"
                checked={Boolean(optionValues?.[index]?.is_correct)}
                onChange={(event) => setCorrect(index, event.target.checked)}
                aria-label="Правильный вариант"
              />
              <div className="flex-1">
                <Input {...form.register(`options.${index}.text`)} placeholder={`Вариант ${index + 1}`} />
                <FieldError>{form.formState.errors.options?.[index]?.text?.message}</FieldError>
              </div>
              <Button tone="ghost" disabled={options.fields.length <= 2} onClick={() => options.remove(index)}>
                Убрать
              </Button>
            </div>
          ))}
          <FieldError>{listMessage(form.formState.errors.options)}</FieldError>
          <div>
            <Button
              tone="ghost"
              disabled={options.fields.length >= 8}
              onClick={() => options.append({ text: "", is_correct: false })}
            >
              Ещё вариант
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Сохраняем…" : question ? "Сохранить вопрос" : "Добавить вопрос"}
        </Button>
        {onDelete ? (
          <Button
            tone="danger"
            onClick={() => {
              if (window.confirm("Удалить вопрос?")) void onDelete();
            }}
          >
            Удалить
          </Button>
        ) : null}
      </div>
    </form>
  );
}
