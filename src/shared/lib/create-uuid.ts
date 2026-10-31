/**
 * UUID v4 문자열을 만든다.
 * `crypto.randomUUID`는 HTTPS·localhost에서만 존재해, HTTP로 배포된 환경에서는
 * 어디서나 쓸 수 있는 `getRandomValues`로 직접 조립한다.
 */
export function createUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
