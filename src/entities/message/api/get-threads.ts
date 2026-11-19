import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type Thread } from '@/entities/message/model/message';

const THREAD_PAGE_SIZE = 100;

export async function getThreads(channelId: number): Promise<Thread[]> {
  const threads: Thread[] = [];

  for (let page = 0; ; page++) {
    const { data } = await instance.get<
      ApiResponse<{ content: Thread[]; last: boolean }>
    >(`/channel/channels/${channelId}/threads`, {
      params: { includeArchived: true, size: THREAD_PAGE_SIZE, page },
    });

    threads.push(...data.data.content);
    // `last`가 없거나 빈 페이지가 와도 끝낸다. 응답 형태가 바뀌어도 요청이 끝없이 반복되지 않게 한다.
    if (data.data.last !== false || data.data.content.length === 0) {
      return threads;
    }
  }
}
