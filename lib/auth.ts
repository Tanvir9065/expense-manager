// PIN login with a signed session cookie.
// Uses Web Crypto so the same code runs in route handlers and in proxy.ts.

export const SESSION_COOKIE = "et_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time string comparison
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function authConfigured(): boolean {
  return Boolean(process.env.APP_PIN && process.env.AUTH_SECRET);
}

// The token depends on both secrets, so changing the PIN signs everyone out.
export async function createSessionToken(): Promise<string> {
  return hmacHex(process.env.AUTH_SECRET ?? "", `session:${process.env.APP_PIN ?? ""}`);
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token || !authConfigured()) return false;
  return safeEqual(token, await createSessionToken());
}

export async function checkPin(pin: string): Promise<boolean> {
  if (!authConfigured()) return false;
  const secret = process.env.AUTH_SECRET ?? "";
  const [a, b] = await Promise.all([
    hmacHex(secret, `pin:${pin}`),
    hmacHex(secret, `pin:${process.env.APP_PIN ?? ""}`),
  ]);
  return safeEqual(a, b);
}
