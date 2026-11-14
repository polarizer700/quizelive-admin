import { api, bindSession, call } from "@shared/api";

import { hasSessionHint, useSessionStore } from "../model/store";
import type { User } from "../model/types";

export async function register(body: { email: string; password: string }) {
  await call(() => api.POST("/api/v1/auth/register", { body }), { auth: false });
}

export async function forgotPassword(email: string) {
  await call(() => api.POST("/api/v1/auth/forgot-password", { body: { email } }), { auth: false });
}

export async function resetPassword(body: { token: string; password: string }) {
  await call(() => api.POST("/api/v1/auth/reset-password", { body }), { auth: false });
}

const pendingVerifications = new Map<string, Promise<void>>();

export function verifyEmail(token: string) {
  const existing = pendingVerifications.get(token);
  if (existing) return existing;

  const request = call(() => api.POST("/api/v1/auth/verify-email", { body: { token } }), { auth: false }).finally(() => {
    pendingVerifications.delete(token);
  });
  pendingVerifications.set(token, request);
  return request;
}

export async function login(body: { email: string; password: string }) {
  const data = await call(
    () => api.POST("/api/v1/auth/login", { body }),
    { auth: false },
  );
  useSessionStore.getState().setSession(data.access_token, data.user);
  return data.user;
}

export async function refreshSession() {
  const result = await api.POST("/api/v1/auth/refresh");
  if (!result.response.ok || !result.data) {
    useSessionStore.getState().clear();
    return false;
  }
  useSessionStore.getState().setSession(result.data.access_token, result.data.user);
  return true;
}

export async function logout() {
  try {
    await api.POST("/api/v1/auth/logout");
  } finally {
    useSessionStore.getState().clear();
  }
}

let bootstrapped: Promise<boolean> | null = null;

export function bootstrapSession() {
  if (!hasSessionHint()) {
    bootstrapped ??= Promise.resolve(false);
    return bootstrapped;
  }
  bootstrapped ??= refreshSession();
  return bootstrapped;
}

bindSession({
  token: () => useSessionStore.getState().accessToken,
  refresh: refreshSession,
});

export type { User };
