export const VOICE_ERRORS = {
  join: '음성 채널에 연결하지 못했습니다',
  toggleMic: '마이크 상태를 바꾸지 못했습니다',
  resumeAudio: '소리를 켜지 못했습니다',
} as const;

// 카메라 송출은 서버가 screen_share 권한으로 판정한다
export const CAMERA_FORBIDDEN =
  '카메라 권한이 없습니다. 팀 관리자에게 화면 공유 권한을 요청하세요';

export function toCameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : undefined;

  if (name === 'NotAllowedError')
    return '브라우저에서 카메라가 차단되어 있습니다. 주소창의 사이트 설정에서 허용해 주세요';
  if (name === 'NotFoundError') return '연결된 카메라를 찾지 못했습니다';
  if (name === 'NotReadableError')
    return '다른 앱이 카메라를 사용하고 있습니다';

  return '카메라를 켜지 못했습니다';
}
