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
