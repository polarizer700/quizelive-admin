import { z } from "zod";

export const quizSchema = z.object({
  title: z.string().trim().min(1, "Введите название").max(200, "Не длиннее 200 символов"),
  description: z.string().trim().max(2000, "Не длиннее 2000 символов"),
  status: z.enum(["draft", "published"]),
});

export type QuizValues = z.infer<typeof quizSchema>;
