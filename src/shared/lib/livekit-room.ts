import { type Room, Track } from 'livekit-client';

export interface RoomParticipantSnapshot {
  identity: string;
  userId: number | null;
  speaking: boolean;
  muted: boolean;
  isLocal: boolean;
}

export function toRoomParticipants(room: Room): RoomParticipantSnapshot[] {
  const all = [room.localParticipant, ...room.remoteParticipants.values()];

  return all.map((participant) => {
    const userId = Number.parseInt(participant.identity, 10);

    return {
      identity: participant.identity,
      userId: Number.isNaN(userId) ? null : userId,
      speaking: participant.isSpeaking,
      muted: !participant.isMicrophoneEnabled,
      isLocal: participant.isLocal,
    };
  });
}

export interface RoomCamera {
  identity: string;
  userId: number | null;
  track: Track;
  isLocal: boolean;
}

export function toRoomCameras(room: Room): RoomCamera[] {
  const all = [room.localParticipant, ...room.remoteParticipants.values()];

  return all.flatMap((participant) => {
    const publication = participant.getTrackPublication(Track.Source.Camera);
    // 카메라를 끄면 발행은 남기고 음소거만 하므로 꺼진 트랙은 뺀다
    if (!publication?.track || publication.isMuted) return [];

    const userId = Number.parseInt(participant.identity, 10);

    return [
      {
        identity: participant.identity,
        userId: Number.isNaN(userId) ? null : userId,
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
