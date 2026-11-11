import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Channel } from '@/entities/channel/model/channel';

/** 프로젝트에 속한 채널. 채널 서비스가 내려준다. */
export async function getProjectChannels(
  projectId: number,
): Promise<Channel[]> {
  const { data } = await instance.get<ApiResponse<Channel[]>>(
    `/channel/projects/${projectId}/channels`,
  );

  return data.data;
}
