import { isAxiosError } from 'axios';

/** 업로드 실패 원인을 사용자가 할 수 있는 일 위주로 바꾼다. */
export function toUploadError(error: unknown): string {
  if (!isAxiosError(error)) return '파일을 올리지 못했어요';
  if (!error.response) return '네트워크 연결이 불안정해 올리지 못했어요';

  const { status, data } = error.response;
  const message =
    typeof data === 'object' && data !== null && 'message' in data
      ? String(data.message)
      : '';

  if (status === 403) return '이 채널에 파일을 올릴 권한이 없어요';
  if (status === 413) return '파일이 너무 커요';
  if (status === 429)
    return '업로드 요청이 너무 많아요. 잠시 후 다시 시도해 주세요';
  // 서버는 허용 목록에 없는 MIME 타입을 400으로 거절한다
  if (status === 400 && message.startsWith('허용되지 않은 파일 형식'))
    return '올릴 수 없는 파일 형식이에요';

  return '파일을 올리지 못했어요';
}
