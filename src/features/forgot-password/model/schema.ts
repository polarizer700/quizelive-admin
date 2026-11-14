import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Введите почту").email("Почта выглядит неверно"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
