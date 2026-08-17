import "client-only";

import { SESSION_STORAGE_KEY, sessionIdSchema } from "@/lib/session";

export function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing && sessionIdSchema.safeParse(existing).success) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}
