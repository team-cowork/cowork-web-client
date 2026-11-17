import axios from 'axios';

import {
  type NoteSummary,
  type NoteSummaryRequest,
} from '@/features/note-ai-summary/model/note-summary';

/** 같은 origin 의 실험용 라우트를 부른다. 서버 API(`instance`)가 아니라서 토큰을 붙이지 않는다. */
export async function postNoteSummary(
  request: NoteSummaryRequest,
): Promise<NoteSummary> {
  const { data } = await axios.post<NoteSummary>('/api/ai/summary', request);
  return data;
}
