import { z } from "zod";

import { isPasswordStrongEnough } from "@shared/lib/password";

export const userSchema = z.object({
  email: z.string().trim().min(1, "Введите почту").email("Почта выглядит неверно"),
  password: z
    .string()
    .max(200, "Не длиннее 200 символов")
    .refine(isPasswordStrongEnough, "Пароль слишком простой"),
  role: z.enum(["admin", "editor", "host"]),
});

export type UserValues = z.infer<typeof userSchema>;
