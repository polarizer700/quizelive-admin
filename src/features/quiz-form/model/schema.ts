import { z } from "zod";

export const quizSchema = z.object({
  title: z.string().trim().min(1, "Введите название").max(200, "Не длиннее 200 символов"),
  description: z.string().trim().max(2000, "Не длиннее 2000 символов"),
  status: z.enum(["draft", "published"]),
  game_type: z.enum(["quiz", "pub_quiz", "jeopardy"]),
  break_after_round: z
    .number({ error: "Укажите раунд" })
    .int("Целое число")
    .min(0, "0 — без перерыва")
    .max(10, "Не больше 10"),
});

export type QuizValues = z.infer<typeof quizSchema>;
