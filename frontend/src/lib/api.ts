const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function buildHeaders(token?: string, headers?: HeadersInit): Headers {
  const merged = new Headers(headers);
  if (!merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }
  if (token) {
    merged.set("Authorization", `Bearer ${token}`);
  }
  return merged;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(token, options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}
