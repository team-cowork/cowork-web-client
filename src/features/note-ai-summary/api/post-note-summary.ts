import { instance } from '@/shared/api/instance';
import {
  type NoteSummary,
  type NoteSummaryRequest,
} from '@/features/note-ai-summary/model/note-summary';

/**
 * 같은 origin 의 요약 라우트를 부른다. `instance` 의 토큰 부착·갱신을 그대로 쓰되,
 * 서버 API 가 아니라 웹 앱 자신의 라우트라서 baseURL 을 비운다.
 */
export async function postNoteSummary(
  request: NoteSummaryRequest,
): Promise<NoteSummary> {
  const { data } = await instance.post<NoteSummary>(
    '/api/ai/summary',
    request,
    { baseURL: '' },
  );
  return data;
}
