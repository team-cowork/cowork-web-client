import { isAxiosError } from 'axios';

import { ChatFileUploadError } from '@/entities/message/lib/upload-chat-file';
import { getHttpStatus } from '@/shared/api/http-error';

const UPLOAD_FAILED = '파일을 올리지 못했어요';
const TRY_LATER = '잠시 후 다시 시도해 주세요';

/** 업로드 실패 원인을 사용자가 할 수 있는 일 위주로 바꾼다. */
export function toUploadError(error: unknown): string {
  const step = error instanceof ChatFileUploadError ? error.step : undefined;
  const cause = error instanceof ChatFileUploadError ? error.original : error;
  const status = getHttpStatus(cause);

  if (status === undefined) {
    return isAxiosError(cause)
      ? '네트워크 연결이 불안정해 올리지 못했어요'
      : UPLOAD_FAILED;
  }

  if (status === 413) return '파일이 너무 커요';
  // 스토리지는 서명 불일치·만료나 게이트웨이 정책으로도 4xx를 돌려준다.
  // 권한·형식 문제로 안내하면 틀릴 수 있어, 다시 올리라는 일반 문구로 둔다.
  if (step === 'storage') return UPLOAD_FAILED;

  if (status === 403) return '이 채널에 파일을 올릴 권한이 없어요';
  if (status === 429) return `업로드 요청이 너무 많아요. ${TRY_LATER}`;
  // 확인 단계의 409는 스토리지 업로드가 아직 안 끝난 경우라 다시 올리면 된다
  if (status === 409) {
    return step === 'confirm'
      ? `${UPLOAD_FAILED}. 다시 시도해 주세요`
      : '보관된 채널에는 파일을 올릴 수 없어요';
  }
  // 서버가 권한 정보를 동기화하는 중이다
  if (status === 503) return `${UPLOAD_FAILED}. ${TRY_LATER}`;
  // 서버는 허용 목록에 없는 MIME 타입을 400으로 거절한다. 구분할 오류 코드가 없어 문구로 판별한다.
  if (
    status === 400 &&
    serverMessage(cause).startsWith('허용되지 않은 파일 형식')
  )
    return '올릴 수 없는 파일 형식이에요';

  return UPLOAD_FAILED;
}

function serverMessage(error: unknown): string {
  if (!isAxiosError(error)) return '';

  const data: unknown = error.response?.data;
  return typeof data === 'object' && data !== null && 'message' in data
    ? String(data.message)
    : '';
}
