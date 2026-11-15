import { api, call } from "@shared/api";

import type { components } from "@shared/api/generated/schema";

export type Quiz = components["schemas"]["Quiz"];
export type QuizStatus = components["schemas"]["QuizStatus"];
export type QuizList = components["schemas"]["QuizList"];
export type CreateQuizRequest = components["schemas"]["CreateQuizRequest"];
export type UpdateQuizRequest = components["schemas"]["UpdateQuizRequest"];
export type HostToken = components["schemas"]["HostToken"];
export type PublicGame = components["schemas"]["PublicGame"];
export type PublicGameList = components["schemas"]["PublicGameList"];

export const publicGameKeys = {
  all: ["public-games"] as const,
  list: (query: PublicGameListQuery) => [...publicGameKeys.all, "list", query] as const,
};

export const quizKeys = {
  all: ["quizzes"] as const,
  list: (query: QuizListQuery) => [...quizKeys.all, "list", query] as const,
  detail: (quizId: string) => [...quizKeys.all, "detail", quizId] as const,
};

export type QuizListQuery = {
  limit: number;
  offset: number;
  status?: QuizStatus | "";
  game_type?: Quiz["game_type"] | "";
  q?: string;
};

export function listQuizzes(query: QuizListQuery) {
  return call<QuizList>(() =>
    api.GET("/api/v1/quizzes", {
      params: {
        query: {
          limit: query.limit,
          offset: query.offset,
          ...(query.status ? { status: query.status } : {}),
          ...(query.game_type ? { game_type: query.game_type } : {}),
          ...(query.q ? { q: query.q } : {}),
        },
      },
    }),
  );
}

export type PublicGameListQuery = {
  limit: number;
  offset: number;
  game_type?: PublicGame["game_type"] | "";
  q?: string;
};

export function listPublicGames(query: PublicGameListQuery) {
  return call<PublicGameList>(() =>
    api.GET("/api/v1/games/public", {
      params: {
        query: {
          limit: query.limit,
          offset: query.offset,
          ...(query.game_type ? { game_type: query.game_type } : {}),
          ...(query.q ? { q: query.q } : {}),
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
