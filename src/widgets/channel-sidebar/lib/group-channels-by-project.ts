import { type Channel } from '@/entities/channel/model/channel';

export interface ChannelGroup {
  projectId: number | null;
  channels: Channel[];
}

/**
 * 채널을 프로젝트별로 묶는다.
 * `projectIds` 순서(팀 프로젝트 정렬 순서)를 따르고, 채널이 없는 프로젝트도 빈 그룹으로 둔다.
 * 목록에 없는 프로젝트의 채널은 그 뒤에, 프로젝트 미소속 채널은 맨 끝에 둔다.
 * 미소속 그룹은 비어 있어도 둬서 채널을 끌어 프로젝트에서 뺄 수 있게 한다.
 */
export function groupChannelsByProject(
  channels: Channel[],
  projectIds: number[] = [],
): ChannelGroup[] {
  const groups = new Map<number | null, Channel[]>([
    ...projectIds.map((projectId): [number, Channel[]] => [projectId, []]),
    [null, []],
  ]);

  for (const channel of channels) {
    const key = channel.projectId ?? null;
    const bucket = groups.get(key);

    if (bucket) {
      bucket.push(channel);
    } else {
      groups.set(key, [channel]);
    }
  }

  const order = (projectId: number | null) => {
    if (projectId === null) return Number.MAX_SAFE_INTEGER;

    const index = projectIds.indexOf(projectId);
    return index === -1 ? projectIds.length + projectId : index;
  };

  return [...groups.entries()]
    .map(([projectId, grouped]) => ({
      projectId,
      channels: [...grouped].sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => order(a.projectId) - order(b.projectId));
}
