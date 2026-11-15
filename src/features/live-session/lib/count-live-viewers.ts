import { type RoomParticipantSnapshot } from '@/shared/lib/livekit-room';

// 방송 방에는 호스트도 참가자로 들어 있으므로 호스트를 뺀 수가 시청자 수다
export function countLiveViewers(
  participants: RoomParticipantSnapshot[],
  hostUserId: number | null,
): number {
  return participants.filter((participant) => participant.userId !== hostUserId)
    .length;
}
