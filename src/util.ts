export function typedEntries<T extends object>(
  obj: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

export function debugLog(
  debug: boolean | undefined,
  message: string,
  ...args: any[]
) {
  if (debug) {
    console.log(`ℹ️ drizzle-zero: ${message}`, ...args);
  }
}
