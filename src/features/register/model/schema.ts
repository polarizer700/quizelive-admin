import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().min(1, "Введите почту").email("Почта выглядит неверно"),
  password: z.string().min(8, "Минимум 8 символов").max(200, "Не длиннее 200 символов"),
});

export type RegisterValues = z.infer<typeof registerSchema>;
