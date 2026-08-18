export const formatFetchError = (
  status: number,
  body: { message?: string } | null,
): string => {
  const message = body?.message || `HTTP ${status}`
  if (status === 403 && /rate limit/i.test(message)) {
    return `${message}\n   Set GITHUB_TOKEN and retry (authenticated limit is ~5000 requests/hour).`
  }
  return message
}
