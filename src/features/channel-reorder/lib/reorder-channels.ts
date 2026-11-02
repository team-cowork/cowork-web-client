import { type Channel } from '@/entities/channel/model/channel';

export interface ReorderableGroup {
  projectId: number | null;
  channels: Channel[];
}

export function groupDroppableId(projectId: number | null): string {
  return `channel-group-${projectId ?? 'none'}`;
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return items;

  next.splice(to, 0, moved);
  return next;
}

export function buildReorderedChannelIds(
  groups: ReorderableGroup[],
  droppableId: string,
  from: number,
  to: number,
): number[] | null {
  const target = groups.find(
    (group) => groupDroppableId(group.projectId) === droppableId,
  );
  if (!target) return null;

  const reordered = moveItem(target.channels, from, to);

  return groups.flatMap((group) =>
    (group === target ? reordered : group.channels).map(
      (channel) => channel.id,
    ),
  );
}

export interface ChannelMove {
  channelId: number;
  projectId: number | null;
  orderedChannelIds: number[];
}

/** 다른 그룹(프로젝트)으로 끌어 놓은 채널의 새 소속과 팀 전체 순서를 구한다. */
export function buildChannelMove(
  groups: ReorderableGroup[],
  sourceId: string,
  from: number,
  destinationId: string,
  to: number,
): ChannelMove | null {
  const source = groups.find(
    (group) => groupDroppableId(group.projectId) === sourceId,
  );
  const destination = groups.find(
    (group) => groupDroppableId(group.projectId) === destinationId,
  );
  const moved = source?.channels[from];
  if (!source || !destination || !moved) return null;

  const destinationChannels = [...destination.channels];
  destinationChannels.splice(to, 0, moved);

  return {
    channelId: moved.id,
    projectId: destination.projectId,
    orderedChannelIds: groups.flatMap((group) => {
      if (group === source) {
        return group.channels
          .filter((channel) => channel.id !== moved.id)
          .map((channel) => channel.id);
      }
      if (group === destination) {
        return destinationChannels.map((channel) => channel.id);
      }
      return group.channels.map((channel) => channel.id);
    }),
  };
}

export function applyChannelOrder(
  channels: Channel[],
  orderedChannelIds: number[],
): Channel[] {
  const positionById = new Map(
    orderedChannelIds.map((channelId, index) => [channelId, index]),
  );

  return channels
    .map((channel) => {
      const position = positionById.get(channel.id);
      return position === undefined ? channel : { ...channel, position };
    })
    .sort((a, b) => a.position - b.position);
}
