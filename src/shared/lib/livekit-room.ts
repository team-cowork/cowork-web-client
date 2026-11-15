import { type Room, Track } from 'livekit-client';

export interface RoomParticipantSnapshot {
  identity: string;
  userId: number | null;
  speaking: boolean;
  muted: boolean;
  isLocal: boolean;
}

// 서버는 LiveKit identity에 사용자 ID를 넣는다. 참여자와 카메라를 같은 규칙으로 묶어야 카드에 영상이 붙는다
export function toUserId(identity: string): number | null {
  const userId = Number.parseInt(identity, 10);

  return Number.isNaN(userId) ? null : userId;
}

// 내 참가자를 맨 앞에 두고 원격 참가자를 잇는다
export function listParticipants(room: Room) {
  return [room.localParticipant, ...room.remoteParticipants.values()];
}

export function toRoomParticipants(room: Room): RoomParticipantSnapshot[] {
  return listParticipants(room).map((participant) => ({
    identity: participant.identity,
    userId: toUserId(participant.identity),
    speaking: participant.isSpeaking,
    muted: !participant.isMicrophoneEnabled,
    isLocal: participant.isLocal,
  }));
}

export interface RoomCamera {
  identity: string;
  userId: number | null;
  track: Track;
  isLocal: boolean;
}

export function toRoomCameras(room: Room): RoomCamera[] {
  return listParticipants(room).flatMap((participant) => {
    const publication = participant.getTrackPublication(Track.Source.Camera);
    // 카메라를 끄면 발행은 남기고 음소거만 하므로 꺼진 트랙은 뺀다
    if (!publication?.track || publication.isMuted) return [];

    return [
      {
        identity: participant.identity,
        userId: toUserId(participant.identity),
        track: publication.track,
        isLocal: participant.isLocal,
      },
    ];
  });
}

export function applyRemoteVolume(room: Room, enabled: boolean) {
  const volume = enabled ? 1 : 0;

  room.remoteParticipants.forEach((participant) => {
    participant.setVolume(volume);
    participant.setVolume(volume, Track.Source.ScreenShareAudio);
  });
}

// 서버는 screen_share 권한이 있을 때만 토큰에 카메라 송출을 넣는다
export function canPublishCamera(room: Room) {
  const permissions = room.localParticipant.permissions;

  if (!permissions?.canPublish) return false;

  const sources = permissions.canPublishSources;

  return (
    sources.length === 0 ||
    sources.includes(Track.sourceToProto(Track.Source.Camera))
  );
}
