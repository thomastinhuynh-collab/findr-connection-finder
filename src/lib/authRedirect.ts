const KEY = "findr_auth_destination";
const TTL = 24 * 60 * 60 * 1000;

export function safeAuthDestination(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname === "/auth/callback" || url.pathname === "/reset-password") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}

export function rememberAuthDestination(value: string): void {
  const path = safeAuthDestination(value);
  if (!path) return;
  try { localStorage.setItem(KEY, JSON.stringify({ path, expires: Date.now() + TTL })); } catch { /* URL remains the fallback. */ }
}

export function readAuthDestination(): string | null {
  try {
    const record = JSON.parse(localStorage.getItem(KEY) || "null");
    if (record && record.expires > Date.now()) return safeAuthDestination(record.path);
  } catch { /* Unavailable or invalid storage. */ }
  return null;
}

export function clearAuthDestination(): void {
  try { localStorage.removeItem(KEY); } catch { /* Unavailable storage. */ }
}

export function authCallbackUrl(): string {
  const destination = readAuthDestination();
  return `${window.location.origin}/auth/callback${destination ? `?next=${encodeURIComponent(destination)}` : ""}`;
}