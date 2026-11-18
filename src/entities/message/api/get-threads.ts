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
    if (data.data.last) return threads;
  }
}
