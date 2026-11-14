import { z } from "zod";

import { isPasswordStrongEnough } from "@shared/lib/password";

export const registerSchema = z.object({
  email: z.string().trim().min(1, "Введите почту").email("Почта выглядит неверно"),
  password: z
    .string()
    .max(200, "Не длиннее 200 символов")
    .refine(isPasswordStrongEnough, "Пароль слишком простой"),
  consent: z.literal(true, { message: "Нужно согласие на обработку данных" }),
});

export type RegisterValues = z.infer<typeof registerSchema>;
