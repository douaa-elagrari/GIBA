/**
 * Converts raw API/network errors into clean, user-friendly messages.
 * Never exposes localhost URLs, stack traces, or raw HTTP status codes.
 */
export function formatError(err: unknown): string {
  if (!err) return "An unexpected error occurred.";

  // Already a string
  if (typeof err === "string") return sanitize(err);

  if (err instanceof Error) {
    const msg = err.message ?? "";

    // Network / fetch failures
    if (
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("ERR_CONNECTION_REFUSED")
    ) {
      return "Unable to reach the server. Please check your connection and try again.";
    }

    // Timeout
    if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
      return "The request timed out. Please try again.";
    }

    return sanitize(msg);
  }

  return "An unexpected error occurred.";
}

/** Strip localhost URLs and raw technical noise from a message */
function sanitize(msg: string): string {
  // Remove anything that looks like a URL (http/https)
  return msg
    .replace(/https?:\/\/[^\s,)]+/gi, "")
    .replace(/localhost:\d+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim() || "An unexpected error occurred.";
}
