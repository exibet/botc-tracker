export function extractErrorMessage(
  err: unknown,
  fallback: string,
): string {
  if (
    typeof err === 'object'
    && err !== null
    && 'data' in err
    && typeof (err as { data?: { message?: string } }).data?.message === 'string'
  ) {
    return (err as { data: { message: string } }).data.message
  }
  if (err instanceof Error) return err.message
  return fallback
}
