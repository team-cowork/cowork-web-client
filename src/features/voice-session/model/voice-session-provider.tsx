'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Room, RoomEvent } from 'livekit-client';

import { postVoiceJoin } from '@/entities/voice/api/post-voice-join';
import { postVoiceLeave } from '@/entities/voice/api/post-voice-leave';
import { voiceQueries } from '@/entities/voice/api/voice-queries';
import { type VoiceRoomParticipant } from '@/entities/voice/model/voice';

export type VoiceSessionStatus = 'idle' | 'connecting' | 'connected';

interface VoiceSessionContextValue {
  channelId: number | null;
  sessionId: string | null;
  status: VoiceSessionStatus;
  participants: VoiceRoomParticipant[];
  micEnabled: boolean;
  audioEnabled: boolean;
  join: (channelId: number) => Promise<void>;
  leave: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleAudio: () => void;
}

const VoiceSessionContext = createContext<VoiceSessionContextValue | null>(
  null,
);

export function useVoiceSession() {
  const ctx = useContext(VoiceSessionContext);
  if (!ctx)
    throw new Error(
      'useVoiceSession은 VoiceSessionProvider 내부에서만 사용할 수 있습니다',
    );
  return ctx;
}

function toRoomParticipants(room: Room): VoiceRoomParticipant[] {
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

function applyRemoteVolume(room: Room, enabled: boolean) {
  room.remoteParticipants.forEach((participant) => {
    participant.setVolume(enabled ? 1 : 0);
  });
}

export function VoiceSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const roomRef = useRef<Room | null>(null);
  const audioEnabledRef = useRef(true);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const channelIdRef = useRef<number | null>(null);
  const generationRef = useRef(0);

  const [channelId, setChannelId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [participants, setParticipants] = useState<VoiceRoomParticipant[]>([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const reset = useCallback(() => {
    generationRef.current += 1;
    roomRef.current = null;
    channelIdRef.current = null;
    setChannelId(null);
    setSessionId(null);
    setStatus('idle');
    setParticipants([]);
  }, []);

  const runExclusive = useCallback((task: () => Promise<void>) => {
    const run = queueRef.current.then(task, task);

    queueRef.current = run.catch(() => undefined);

    return run;
  }, []);

  const notifyLeave = useCallback(
    async (leftChannelId: number) => {
      try {
        await postVoiceLeave(leftChannelId);
      } finally {
        await queryClient.invalidateQueries({
          queryKey: voiceQueries.participants(leftChannelId).queryKey,
        });
      }
    },
    [queryClient],
  );

  const disconnect = useCallback(async () => {
    const room = roomRef.current;
    const currentChannelId = channelIdRef.current;

    reset();

    if (room) await room.disconnect();
    if (currentChannelId === null) return;

    await notifyLeave(currentChannelId);
  }, [notifyLeave, reset]);

  const joinChannel = useCallback(
    async (nextChannelId: number) => {
      if (roomRef.current || channelIdRef.current !== null) await disconnect();

      channelIdRef.current = nextChannelId;
      setStatus('connecting');
      setChannelId(nextChannelId);

      const generation = generationRef.current;
      const isCurrent = () => generationRef.current === generation;

      let room: Room | null = null;
      let sessionStarted = false;

      try {
        const session = await postVoiceJoin(nextChannelId);

        sessionStarted = true;

        room = new Room({ adaptiveStream: true, dynacast: true });
        const boundRoom = room;
        const sync = () => {
          if (isCurrent()) setParticipants(toRoomParticipants(boundRoom));
        };

        room
          .on(RoomEvent.ParticipantConnected, () => {
            applyRemoteVolume(boundRoom, audioEnabledRef.current);
            sync();
          })
          .on(RoomEvent.ParticipantDisconnected, sync)
          .on(RoomEvent.ActiveSpeakersChanged, sync)
          .on(RoomEvent.TrackMuted, sync)
          .on(RoomEvent.TrackUnmuted, sync)
          .on(RoomEvent.LocalTrackPublished, sync)
          .on(RoomEvent.LocalTrackUnpublished, sync)
          .on(RoomEvent.Disconnected, () => {
            if (!isCurrent()) return;

            const leftChannelId = channelIdRef.current;

            reset();

            if (leftChannelId !== null)
              void notifyLeave(leftChannelId).catch(() => undefined);
          });

        await room.connect(session.livekit_url, session.token);
        roomRef.current = room;

        try {
          await room.localParticipant.setMicrophoneEnabled(micEnabled);
        } catch {
          setMicEnabled(false);
        }

        if (!room.canPlaybackAudio) await room.startAudio();
        applyRemoteVolume(room, audioEnabledRef.current);

        setSessionId(session.session_id);
        setStatus('connected');
        sync();

        await queryClient.invalidateQueries({
          queryKey: voiceQueries.participants(nextChannelId).queryKey,
        });
      } catch (error) {
        reset();

        await room?.disconnect();

        if (sessionStarted)
          await notifyLeave(nextChannelId).catch(() => undefined);

        throw error;
      }
    },
    [disconnect, micEnabled, notifyLeave, queryClient, reset],
  );

  const join = useCallback(
    (nextChannelId: number) => runExclusive(() => joinChannel(nextChannelId)),
    [joinChannel, runExclusive],
  );

  const leave = useCallback(
    () => runExclusive(disconnect),
    [disconnect, runExclusive],
  );

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    const next = !micEnabled;

    setMicEnabled(next);

    if (!room) return;

    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setParticipants(toRoomParticipants(room));
    } catch (error) {
      setMicEnabled(!next);
      throw error;
    }
  }, [micEnabled]);

  const toggleAudio = useCallback(() => {
    const next = !audioEnabled;

    audioEnabledRef.current = next;
    setAudioEnabled(next);

    if (roomRef.current) applyRemoteVolume(roomRef.current, next);
  }, [audioEnabled]);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  const value = useMemo(
    () => ({
      channelId,
      sessionId,
      status,
      participants,
      micEnabled,
      audioEnabled,
      join,
      leave,
      toggleMic,
      toggleAudio,
    }),
    [
      audioEnabled,
      channelId,
      join,
      leave,
      micEnabled,
      participants,
      sessionId,
      status,
      toggleAudio,
      toggleMic,
    ],
  );

  return (
    <VoiceSessionContext.Provider value={value}>
      {children}
    </VoiceSessionContext.Provider>
  );
}
