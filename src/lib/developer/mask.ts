const SENSITIVE_KEYS = new Set([
  "webhook_secret",
  "secret",
  "api_key",
  "apikey",
  "x-webhook-token",
  "authorization",
  "access_token",
  "refresh_token",
  "key_hash",
  "password",
  "token",
]);

export function maskSensitive(input: unknown, depth = 0): unknown {
  if (depth > 4 || input == null) return input;
  if (Array.isArray(input)) return input.map((v) => maskSensitive(v, depth + 1));
  if (typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) out[k] = "***";
      else out[k] = maskSensitive(v, depth + 1);
    }
    return out;
  }
  return input;
}