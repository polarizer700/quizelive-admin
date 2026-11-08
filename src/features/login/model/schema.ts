import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Введите почту").email("Почта выглядит неверно"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginValues = z.infer<typeof loginSchema>;
