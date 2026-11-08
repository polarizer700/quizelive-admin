import createClient from "openapi-fetch";

import type { paths } from "./generated/schema";
import { toApiError } from "./errors";

type ApiResult<T> = {
  data?: T;
  error?: unknown;
  response: Response;
};

type SessionBridge = {
  token: () => string | null;
  refresh: () => Promise<boolean>;
};

let bridge: SessionBridge = {
  token: () => null,
  refresh: async () => false,
};

let pendingRefresh: Promise<boolean> | null = null;

export function bindSession(next: SessionBridge) {
  bridge = next;
}

export const api = createClient<paths>({
  baseUrl: "",
  credentials: "include",
});

api.use({
  onRequest({ request }) {
    const token = bridge.token();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
});

export function refreshOnce() {
  pendingRefresh ??= bridge.refresh().finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

export async function call<T>(run: () => Promise<ApiResult<T>>, options?: { auth?: boolean }): Promise<T> {
  const first = await run();
  if (options?.auth !== false && first.response.status === 401) {
    const restored = await refreshOnce();
    if (restored) return take(await run());
  }
  return take(first);
}

function take<T>(result: ApiResult<T>): T {
  if (result.response.ok) return result.data as T;
  throw toApiError(result.response.status, result.error);
}
