function toOrigin(url: string | undefined): string | null {
  if (!url) return null;

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

// 빌드 때 주입되는 API 주소의 출처. 환경마다 게이트웨이 주소가 달라도 따로 고칠 필요가 없다.
const API_ORIGIN = toOrigin(process.env.NEXT_PUBLIC_BASE_URL);

/** API와 같은 출처(게이트웨이)에서 내려오는 주소인지. 상대 경로는 아니다. */
export function isApiOrigin(url: string): boolean {
  return API_ORIGIN !== null && toOrigin(url) === API_ORIGIN;
}
