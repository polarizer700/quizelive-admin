import { z } from "zod";

export const userSchema = z.object({
  email: z.string().trim().min(1, "Введите почту").email("Почта выглядит неверно"),
  password: z.string().min(8, "Минимум 8 символов").max(200, "Не длиннее 200 символов"),
  role: z.enum(["admin", "editor", "host"]),
});

export type UserValues = z.infer<typeof userSchema>;
