import { api, call } from "@shared/api";

import type { components } from "@shared/api/generated/schema";

export type Quiz = components["schemas"]["Quiz"];
export type QuizStatus = components["schemas"]["QuizStatus"];
export type QuizList = components["schemas"]["QuizList"];
export type CreateQuizRequest = components["schemas"]["CreateQuizRequest"];
export type UpdateQuizRequest = components["schemas"]["UpdateQuizRequest"];
export type HostToken = components["schemas"]["HostToken"];

export const quizKeys = {
  all: ["quizzes"] as const,
  list: (query: { limit: number; offset: number }) => [...quizKeys.all, "list", query] as const,
  detail: (quizId: string) => [...quizKeys.all, "detail", quizId] as const,
};

export function listQuizzes(query: { limit: number; offset: number; status?: QuizStatus }) {
  return call<QuizList>(() =>
    api.GET("/api/v1/quizzes", {
      params: {
        query: {
          limit: query.limit,
          offset: query.offset,
          ...(query.status ? { status: query.status } : {}),
        },
      },
    }),
  );
}

export function getQuiz(quizId: string) {
  return call<Quiz>(() =>
    api.GET("/api/v1/quizzes/{quizId}", {
      params: { path: { quizId } },
    }),
  );
}

export function createQuiz(body: CreateQuizRequest) {
  return call<Quiz>(() => api.POST("/api/v1/quizzes", { body }));
}

export function updateQuiz(quizId: string, body: UpdateQuizRequest) {
  return call<Quiz>(() =>
    api.PATCH("/api/v1/quizzes/{quizId}", {
      params: { path: { quizId } },
      body,
    }),
  );
}

export function deleteQuiz(quizId: string) {
  return call<void>(() =>
    api.DELETE("/api/v1/quizzes/{quizId}", {
      params: { path: { quizId } },
    }),
  );
}

export function issueHostToken(quizId: string) {
  return call<HostToken>(() =>
    api.POST("/api/v1/quizzes/{quizId}/host-token", {
      params: { path: { quizId } },
    }),
  );
}
