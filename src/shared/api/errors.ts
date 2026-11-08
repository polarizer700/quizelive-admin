export class ApiError extends Error {
  readonly status: number;
  readonly slug: string;
  readonly fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}, slug = "") {
    super(message);
    this.status = status;
    this.slug = slug;
    this.fields = fields;
  }
}

type ErrorPayload = {
  error?: { slug?: string; message?: string };
  errors?: Record<string, { message?: string }[]>;
};

export function toApiError(status: number, payload: unknown): ApiError {
  if (!isPayload(payload)) {
    return new ApiError("Запрос не выполнен", status);
  }

  const fields: Record<string, string> = {};
  for (const [field, items] of Object.entries(payload.errors ?? {})) {
    const message = items[0]?.message;
    if (message) fields[field] = message;
  }

  return new ApiError(payload.error?.message || "Запрос не выполнен", status, fields, payload.error?.slug ?? "");
}

export function errorMessage(error: unknown, fallback = "Не удалось выполнить запрос") {
  return error instanceof ApiError ? error.message : fallback;
}

function isPayload(value: unknown): value is ErrorPayload {
  return typeof value === "object" && value !== null;
}
