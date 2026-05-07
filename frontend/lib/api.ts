const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const TOKEN_KEY = "token";

const isBrowser = typeof window !== "undefined";

// ----------------------
// TYPES
// ----------------------
type APIErrorResponse = {
  detail?: string | { msg: string }[];
  message?: string;
};

// ----------------------
// CUSTOM ERROR
// ----------------------
export class APIError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.details = details;
  }
}

// ----------------------
// SAFE RESPONSE PARSER
// ----------------------
async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  if (contentType?.includes("text/")) {
    return response.text();
  }

  return null;
}

// ----------------------
// MAIN API REQUEST
// ----------------------
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  // Set JSON header only if NOT FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Add auth token
  if (isBrowser) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // ----------------------
  // TIMEOUT HANDLING
  // ----------------------
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const data = await parseResponse(response);

    // ----------------------
    // ERROR HANDLING
    // ----------------------
    if (!response.ok) {
      let errorMessage = "Something went wrong";

      if (typeof data === "object" && data !== null) {
        const errorData = data as APIErrorResponse;

        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((d) => d.msg)
            .join(", ");
        } else {
          errorMessage =
            errorData.detail ||
            errorData.message ||
            JSON.stringify(data);
        }
      } else if (typeof data === "string") {
        errorMessage = data;
      }

      throw new APIError(response.status, errorMessage, data);
    }

    // ----------------------
    // SAFE RETURN
    // ----------------------
    return (data ?? null) as T;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new APIError(408, "Request timeout");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ----------------------
// AUTH HELPERS
// ----------------------
export function getAuthToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (!isBrowser) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
}