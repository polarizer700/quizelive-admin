import { useSessionStore } from "@entities/session";
import { api, call } from "@shared/api";

import type { components } from "@shared/api/generated/schema";

export type Question = components["schemas"]["Question"];
export type QuestionInput = components["schemas"]["QuestionInput"];
export type QuestionType = components["schemas"]["QuestionType"];

export const questionKeys = {
  list: (quizId: string) => ["questions", quizId] as const,
};

export function listQuestions(quizId: string) {
  return call<Question[]>(() =>
    api.GET("/api/v1/quizzes/{quizId}/questions", {
      params: { path: { quizId } },
    }),
  );
}

export function createQuestion(quizId: string, body: QuestionInput) {
  return call<Question>(() =>
    api.POST("/api/v1/quizzes/{quizId}/questions", {
      params: { path: { quizId } },
      body,
    }),
  );
}

export function updateQuestion(quizId: string, questionId: string, body: QuestionInput) {
  return call<Question>(() =>
    api.PATCH("/api/v1/quizzes/{quizId}/questions/{questionId}", {
      params: { path: { quizId, questionId } },
      body,
    }),
  );
}

export function deleteQuestion(quizId: string, questionId: string) {
  return call<void>(() =>
    api.DELETE("/api/v1/quizzes/{quizId}/questions/{questionId}", {
      params: { path: { quizId, questionId } },
    }),
  );
}

export function reorderQuestions(quizId: string, questionIds: string[]) {
  return call<Question[]>(() =>
    api.POST("/api/v1/quizzes/{quizId}/questions/reorder", {
      params: { path: { quizId } },
      body: { question_ids: questionIds },
    }),
  );
}

export async function uploadQuestionImage(quizId: string, questionId: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`/api/v1/quizzes/${quizId}/questions/${questionId}/image`, {
    method: "POST",
    credentials: "include",
    headers: authHeader(),
    body,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || "Не удалось загрузить картинку");
  }
  return (await response.json()) as Question;
}

export async function deleteQuestionImage(quizId: string, questionId: string) {
  const response = await fetch(`/api/v1/quizzes/${quizId}/questions/${questionId}/image`, {
    method: "DELETE",
    credentials: "include",
    headers: authHeader(),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || "Не удалось удалить картинку");
  }
  return (await response.json()) as Question;
}

function authHeader(): HeadersInit {
  const token = useSessionStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
