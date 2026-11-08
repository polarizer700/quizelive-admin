import type { User } from "./types";

export function canEditQuizzes(role: User["role"] | undefined) {
  return role === "admin" || role === "editor";
}

export function canManageUsers(role: User["role"] | undefined) {
  return role === "admin";
}

export const roleLabel = {
  admin: "Администратор",
  editor: "Редактор",
  host: "Ведущий",
} as const;

export const statusLabel = {
  draft: "Черновик",
  published: "Опубликован",
} as const;

export const questionTypeLabel = {
  single: "Один ответ",
  multiple: "Несколько ответов",
  text: "Свободный текст",
} as const;
