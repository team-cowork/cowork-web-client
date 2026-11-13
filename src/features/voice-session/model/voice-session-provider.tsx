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
import { type RemoteTrack, Room, RoomEvent, Track } from 'livekit-client';

import { postVoiceJoin } from '@/entities/voice/api/post-voice-join';
import { postVoiceLeave } from '@/entities/voice/api/post-voice-leave';
import { voiceQueries } from '@/entities/voice/api/voice-queries';
import { type VoiceRoomParticipant } from '@/entities/voice/model/voice';
import {
  applyRemoteVolume,
  canPublishCamera,
  type RoomCamera,
  toRoomCameras,
  toRoomParticipants,
} from '@/shared/lib/livekit-room';

export type VoiceSessionStatus = 'idle' | 'connecting' | 'connected';

interface VoiceSessionContextValue {
  channelId: number | null;
  sessionId: string | null;
  connectedAt: string | null;
  status: VoiceSessionStatus;
  participants: VoiceRoomParticipant[];
  /** 카메라를 켠 참가자. 서버는 screen_share 권한이 있을 때만 카메라 송출을 허용한다 */
  cameras: RoomCamera[];
  cameraEnabled: boolean;
  canUseCamera: boolean;
  micEnabled: boolean;
  audioEnabled: boolean;
  /** 브라우저 자동재생 정책 때문에 원격 음성을 재생하지 못하는 상태 */
  audioPlaybackBlocked: boolean;
  join: (channelId: number) => Promise<void>;
  leave: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleAudio: () => void;
  /** 사용자 클릭 안에서 호출해야 브라우저가 재생을 허용한다 */
  resumeAudio: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  stopCamera: () => Promise<void>;
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

export function VoiceSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const roomRef = useRef<Room | null>(null);
  const audioTracksRef = useRef(new Set<RemoteTrack>());
  const audioEnabledRef = useRef(true);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const channelIdRef = useRef<number | null>(null);
  const generationRef = useRef(0);

  const [channelId, setChannelId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [participants, setParticipants] = useState<VoiceRoomParticipant[]>([]);
  const [cameras, setCameras] = useState<RoomCamera[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [canUseCamera, setCanUseCamera] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioPlaybackBlocked, setAudioPlaybackBlocked] = useState(false);

  const clearAudio = useCallback(() => {
    audioTracksRef.current.forEach((track) => {
      track.detach().forEach((element) => element.remove());
    });
    audioTracksRef.current.clear();
  }, []);

  const reset = useCallback(() => {
    generationRef.current += 1;
    clearAudio();
    roomRef.current = null;
    channelIdRef.current = null;
    setChannelId(null);
    setSessionId(null);
    setConnectedAt(null);
    setStatus('idle');
    setParticipants([]);
    setCameras([]);
    setCameraEnabled(false);
    setCanUseCamera(false);
    setAudioPlaybackBlocked(false);
  }, [clearAudio]);

  const syncRoom = useCallback((room: Room) => {
    setParticipants(toRoomParticipants(room));
    setCameras(toRoomCameras(room));
    setCameraEnabled(room.localParticipant.isCameraEnabled);
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
          if (isCurrent()) syncRoom(boundRoom);
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
          .on(RoomEvent.TrackSubscribed, (track) => {
            if (!isCurrent()) return;

            if (
              track.kind === Track.Kind.Audio &&
              track.source === Track.Source.Microphone &&
              !audioTracksRef.current.has(track)
            ) {
              const element = track.attach();
              element.hidden = true;
              document.body.appendChild(element);
              audioTracksRef.current.add(track);
              applyRemoteVolume(boundRoom, audioEnabledRef.current);
            }
            sync();
          })
          .on(RoomEvent.TrackUnsubscribed, (track) => {
            if (audioTracksRef.current.delete(track))
              track.detach().forEach((element) => element.remove());
            sync();
          })
          // 팀 역할이 바뀌면 서버가 접속 중에도 카메라 송출 권한을 갱신한다
          .on(RoomEvent.ParticipantPermissionsChanged, (_, participant) => {
            if (!participant.isLocal || !isCurrent()) return;

            setCanUseCamera(canPublishCamera(boundRoom));
            sync();
          })
          .on(RoomEvent.AudioPlaybackStatusChanged, () => {
            if (isCurrent())
              setAudioPlaybackBlocked(!boundRoom.canPlaybackAudio);
          })
          .on(RoomEvent.Disconnected, () => {
            if (!isCurrent()) return;

            const leftChannelId = channelIdRef.current;

            reset();

            if (leftChannelId !== null)
              void notifyLeave(leftChannelId).catch(() => undefined);
          });

        await room.connect(session.livekit_url, session.token);
        if (!isCurrent()) {
          await room.disconnect();
          return;
        }
        roomRef.current = room;

        try {
          await room.localParticipant.setMicrophoneEnabled(micEnabled);
        } catch {
          setMicEnabled(false);
        }

        // 입장 요청과 연결이 길어지면 클릭으로 얻은 재생 허용이 만료돼 startAudio가
        // 거부된다. 입장은 그대로 진행하고 오디오 켜기 버튼(resumeAudio)으로 복구한다
        if (!room.canPlaybackAudio)
          await room.startAudio().catch(() => undefined);
        setAudioPlaybackBlocked(!room.canPlaybackAudio);
        if (!isCurrent()) {
          await room.disconnect();
          return;
        }
        applyRemoteVolume(room, audioEnabledRef.current);

        setCanUseCamera(canPublishCamera(room));
        setSessionId(session.session_id);
        setStatus('connected');
        setConnectedAt(new Date().toISOString());
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
    [disconnect, micEnabled, notifyLeave, queryClient, reset, syncRoom],
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

  const resumeAudio = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    await room.startAudio();
    setAudioPlaybackBlocked(!room.canPlaybackAudio);
  }, []);

  // 브라우저 권한 창을 기다리는 사이 나가기가 먼저 끝나면 새로 만든 카메라
  // 트랙을 정리하지 못하므로, 입장·나가기와 같은 대기열에서 순서대로 처리한다
  const toggleCamera = useCallback(
    () =>
      runExclusive(async () => {
        const room = roomRef.current;
        if (!room) return;

        await room.localParticipant.setCameraEnabled(
          !room.localParticipant.isCameraEnabled,
        );

        if (roomRef.current === room) syncRoom(room);
      }),
    [runExclusive, syncRoom],
  );

  const stopCamera = useCallback(
    () =>
      runExclusive(async () => {
        const room = roomRef.current;
        if (!room?.localParticipant.isCameraEnabled) return;

        await room.localParticipant.setCameraEnabled(false);

        if (roomRef.current === room) syncRoom(room);
      }),
    [runExclusive, syncRoom],
  );

  useEffect(() => {
    return () => {
      clearAudio();
      roomRef.current?.disconnect();
    };
  }, [clearAudio]);

  const value = useMemo(
    () => ({
      channelId,
      sessionId,
      connectedAt,
      status,
      participants,
      cameras,
      cameraEnabled,
      canUseCamera,
      micEnabled,
      audioEnabled,
      audioPlaybackBlocked,
      join,
      leave,
      toggleMic,
      toggleAudio,
      resumeAudio,
      toggleCamera,
      stopCamera,
    }),
    [
      audioEnabled,
      audioPlaybackBlocked,
      cameraEnabled,
      cameras,
      canUseCamera,
      channelId,
      join,
      leave,
      micEnabled,
      participants,
      resumeAudio,
      sessionId,
      connectedAt,
      status,
      stopCamera,
      toggleAudio,
      toggleCamera,
      toggleMic,
    ],
  );

  return (
    <VoiceSessionContext.Provider value={value}>
      {children}
    </VoiceSessionContext.Provider>
  );
}
