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
