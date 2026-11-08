import { api, call } from "@shared/api";

import type { components } from "@shared/api/generated/schema";

export type User = components["schemas"]["User"];
export type UserRole = components["schemas"]["UserRole"];
export type UserList = components["schemas"]["UserList"];
export type CreateUserRequest = components["schemas"]["CreateUserRequest"];
export type UpdateUserRequest = components["schemas"]["UpdateUserRequest"];

export const userKeys = {
  all: ["users"] as const,
  list: (query: { limit: number; offset: number }) => [...userKeys.all, "list", query] as const,
};

export function listUsers(query: { limit: number; offset: number }) {
  return call<UserList>(() =>
    api.GET("/api/v1/users", {
      params: { query: { limit: query.limit, offset: query.offset } },
    }),
  );
}

export function createUser(body: CreateUserRequest) {
  return call<User>(() => api.POST("/api/v1/users", { body }));
}

export function updateUser(userId: string, body: UpdateUserRequest) {
  return call<User>(() =>
    api.PATCH("/api/v1/users/{userId}", {
      params: { path: { userId } },
      body,
    }),
  );
}

export function deleteUser(userId: string) {
  return call<void>(() =>
    api.DELETE("/api/v1/users/{userId}", {
      params: { path: { userId } },
    }),
  );
}
