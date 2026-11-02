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

export function applyRemoteVolume(room: Room, enabled: boolean) {
  const volume = enabled ? 1 : 0;

  room.remoteParticipants.forEach((participant) => {
    participant.setVolume(volume);
    participant.setVolume(volume, Track.Source.ScreenShareAudio);
  });
}
