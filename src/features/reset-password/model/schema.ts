import { z } from "zod";

import { isPasswordStrongEnough } from "@shared/lib/password";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .max(200, "Не длиннее 200 символов")
    .refine(isPasswordStrongEnough, "Пароль слишком простой"),
  confirm: z.string().min(1, "Повторите пароль"),
}).refine((values) => values.password === values.confirm, {
  message: "Пароли не совпадают",
  path: ["confirm"],
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
