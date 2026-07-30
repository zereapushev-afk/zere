export function debugLog(message: string, details?: unknown) {
  if (!import.meta.env.DEV) return;
  console.info(`[Art Swap] ${message}`, details ?? '');
}

export function debugError(message: string, error: unknown) {
  if (!import.meta.env.DEV) return;
  console.error(`[Art Swap] ${message}`, error);
}
