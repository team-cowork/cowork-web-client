export function toWebhookUrl(executionPath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const origin = baseUrl ? new URL(baseUrl).origin : window.location.origin;

  return new URL(executionPath, origin).toString();
}
