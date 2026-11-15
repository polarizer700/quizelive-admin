import { z } from "zod";

const optionSchema = z.object({
  text: z.string(),
  is_correct: z.boolean(),
});

export const questionSchema = z
  .object({
    type: z.enum(["single", "multiple", "text"]),
    text: z.string().trim().min(1, "Введите текст вопроса").max(2000, "Не длиннее 2000 символов"),
    time_limit_sec: z.number({ error: "Укажите время" }).int().min(5, "Минимум 5 секунд").max(300, "Максимум 300 секунд"),
    points: z.number({ error: "Укажите баллы" }).int().min(1, "Минимум 1 балл").max(10000, "Максимум 10000 баллов"),
    category: z.string().trim().max(100, "Не длиннее 100 символов"),
    options: z.array(optionSchema).max(8),
    text_answers: z.array(z.string()).max(20),
  })
  .superRefine((value, ctx) => {
    if (value.type === "text") {
      const answers = value.text_answers.map((item) => item.trim()).filter(Boolean);
      if (answers.length < 1 || answers.length > 20) {
        ctx.addIssue({ code: "custom", path: ["text_answers"], message: "Нужно от 1 до 20 ответов" });
      }
      if (answers.some((item) => [...item].length > 200)) {
        ctx.addIssue({ code: "custom", path: ["text_answers"], message: "Каждый ответ — до 200 символов" });
      }
      return;
    }

    if (value.options.length < 2) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "Нужно от 2 до 8 вариантов" });
    }

    value.options.forEach((option, index) => {
      const length = [...option.text.trim()].length;
      if (length < 1 || length > 500) {
        ctx.addIssue({
          code: "custom",
          path: ["options", index, "text"],
          message: "Вариант — от 1 до 500 символов",
        });
      }
    });

    const correct = value.options.filter((option) => option.is_correct).length;
    if (value.type === "single" && correct !== 1) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "Отметьте ровно один правильный вариант" });
    }
    if (value.type === "multiple" && correct < 1) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "Отметьте хотя бы один правильный вариант" });
    }
  });

export type QuestionValues = z.infer<typeof questionSchema>;

export const emptyQuestion: QuestionValues = {
  type: "single",
  text: "",
  time_limit_sec: 20,
  points: 100,
  category: "",
  options: [
    { text: "", is_correct: true },
    { text: "", is_correct: false },
  ],
  text_answers: [""],
};
