'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  createLocalScreenTracks,
  DisconnectReason,
  type LocalTrack,
  type RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';

import { liveQueries } from '@/entities/live/api/live-queries';
import { postLiveJoin } from '@/entities/live/api/post-live-join';
import { postLiveLeave } from '@/entities/live/api/post-live-leave';
import { postLiveStart } from '@/entities/live/api/post-live-start';
import {
  getLiveChannelId,
  INITIAL_LIVE_SESSION_STATE,
  type LiveEndReason,
  liveSessionReducer,
  type LiveSessionState,
} from '@/features/live-session/model/live-session-state';
import {
  applyRemoteVolume,
  type RoomParticipantSnapshot,
  toRoomParticipants,
} from '@/shared/lib/livekit-room';

type ConnectIntent = 'start' | 'resume' | 'watch';

interface LiveSessionContextValue {
  state: LiveSessionState;
  channelId: number | null;
  participants: RoomParticipantSnapshot[];
  screenShareTrack: Track | null;
  audioEnabled: boolean;
  goLive: (channelId: number, options?: { resume?: boolean }) => Promise<void>;
  watch: (channelId: number) => Promise<void>;
  leave: () => Promise<void>;
  dismiss: () => void;
  toggleAudio: () => void;
}

const LiveSessionContext = createContext<LiveSessionContextValue | null>(null);

export function useLiveSession() {
  const ctx = useContext(LiveSessionContext);
  if (!ctx)
    throw new Error(
      'useLiveSession은 LiveSessionProvider 내부에서만 사용할 수 있습니다',
    );
  return ctx;
}

function toEndReason(reason: DisconnectReason | undefined): LiveEndReason {
  if (reason === DisconnectReason.ROOM_DELETED) return 'host-ended';
  if (reason === DisconnectReason.PARTICIPANT_REMOVED) return 'removed';
  return 'connection-lost';
}

function findScreenShareTrack(room: Room): Track | null {
  const all = [room.localParticipant, ...room.remoteParticipants.values()];

  for (const participant of all) {
    const track = participant.getTrackPublication(
      Track.Source.ScreenShare,
    )?.track;
    if (track) return track;
  }

  return null;
}

interface FocusCaptureController {
  setFocusBehavior: (
    behavior: 'focus-captured-surface' | 'no-focus-change',
  ) => void;
}

// 탭·창을 공유해도 Chrome이 공유 대상으로 화면을 옮기지 않게 한다
function createCaptureController(): FocusCaptureController | undefined {
  const Controller = (
    globalThis as { CaptureController?: new () => FocusCaptureController }
  ).CaptureController;
  if (!Controller) return undefined;

  const controller = new Controller();

  try {
    controller.setFocusBehavior('no-focus-change');
  } catch {
    return undefined;
  }

  return controller;
}

function attachAudio(track: RemoteTrack) {
  if (track.kind !== Track.Kind.Audio) return;

  const element = track.attach();
  element.hidden = true;
  document.body.appendChild(element);
}

function detachAudio(track: RemoteTrack) {
  if (track.kind !== Track.Kind.Audio) return;

  track.detach().forEach((element) => element.remove());
}

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const roomRef = useRef<Room | null>(null);
  const audioEnabledRef = useRef(true);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const channelIdRef = useRef<number | null>(null);
  const generationRef = useRef(0);
  const isHostRef = useRef(false);

  const [state, dispatch] = useReducer(
    liveSessionReducer,
    INITIAL_LIVE_SESSION_STATE,
  );
  const [participants, setParticipants] = useState<RoomParticipantSnapshot[]>(
    [],
  );
  const [screenShareTrack, setScreenShareTrack] = useState<Track | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const clearRoom = useCallback(() => {
    generationRef.current += 1;
    roomRef.current = null;
    channelIdRef.current = null;
    isHostRef.current = false;
    setParticipants([]);
    setScreenShareTrack(null);
  }, []);

  const runExclusive = useCallback((task: () => Promise<void>) => {
    const run = queueRef.current.then(task, task);

    queueRef.current = run.catch(() => undefined);

    return run;
  }, []);

  // 서버는 웹훅을 처리한 뒤에야 세션을 끝내므로, 바로 다시 조회하면 아직
  // 방송 중으로 나온다. 방송이 끝난 게 확실할 때는 캐시를 직접 비운다.
  const markLiveEnded = useCallback(
    (endedChannelId: number) => {
      const { queryKey } = liveQueries.status(endedChannelId);

      void queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, { live: false, viewer_count: 0 });
    },
    [queryClient],
  );

  const notifyLeave = useCallback(
    async (leftChannelId: number, endsLive: boolean) => {
      // 요청 전에 한 번 비워 화면을 바로 바꾸고, 요청 중에 정기 갱신이 옛
      // 상태(방송 중)를 다시 채웠을 수 있어 finally에서 한 번 더 비운다
      if (endsLive) markLiveEnded(leftChannelId);

      try {
        await postLiveLeave(leftChannelId);
      } catch (error) {
        // 호스트 퇴장 웹훅이 먼저 세션을 끝냈다면 404가 정상이다
        if (!isAxiosError(error) || error.response?.status !== 404) throw error;
      } finally {
        if (endsLive) markLiveEnded(leftChannelId);
        else
          await queryClient.invalidateQueries({
            queryKey: liveQueries.status(leftChannelId).queryKey,
          });
      }
    },
    [markLiveEnded, queryClient],
  );

  const disconnect = useCallback(async () => {
    const room = roomRef.current;
    const currentChannelId = channelIdRef.current;
    const wasHost = isHostRef.current;

    clearRoom();
    dispatch({ type: 'LEAVE' });

    if (room) await room.disconnect();
    if (currentChannelId === null) return;

    // 호스트가 나가면 서버가 방을 지우므로 방송 자체가 끝난다
    await notifyLeave(currentChannelId, wasHost);
  }, [clearRoom, notifyLeave]);

  const connect = useCallback(
    async (nextChannelId: number, intent: ConnectIntent) => {
      // 디스코드처럼 화면을 먼저 고르게 하고, 취소하면 아무것도 바꾸지 않는다.
      // 기존 연결은 화면을 고른 뒤에 끊어야 취소했을 때 보던 방송이 남는다.
      let screenTracks: LocalTrack[] =
        intent === 'watch'
          ? []
          : await createLocalScreenTracks({
              audio: true,
              controller: createCaptureController(),
            });

      if (roomRef.current || channelIdRef.current !== null) {
        try {
          await disconnect();
        } catch (error) {
          screenTracks.forEach((track) => track.stop());
          throw error;
        }
      }

      channelIdRef.current = nextChannelId;
      dispatch({
        type: intent === 'watch' ? 'JOIN' : 'START',
        channelId: nextChannelId,
      });

      const generation = generationRef.current;
      const isCurrent = () => generationRef.current === generation;

      let room: Room | null = null;
      let sessionStarted = false;

      try {
        const session =
          intent === 'start'
            ? { ...(await postLiveStart(nextChannelId)), host_user_id: null }
            : await postLiveJoin(nextChannelId);

        sessionStarted = true;

        room = new Room({ adaptiveStream: true, dynacast: true });
        const boundRoom = room;
        const sync = () => {
          if (!isCurrent()) return;

          setParticipants(toRoomParticipants(boundRoom));
          setScreenShareTrack(findScreenShareTrack(boundRoom));
        };

        room
          .on(RoomEvent.ParticipantConnected, () => {
            applyRemoteVolume(boundRoom, audioEnabledRef.current);
            sync();
          })
          .on(RoomEvent.ParticipantDisconnected, sync)
          .on(RoomEvent.LocalTrackPublished, sync)
          .on(RoomEvent.LocalTrackUnpublished, (publication) => {
            sync();

            // 브라우저의 "공유 중지"로 화면 공유가 끝나면 방송도 끝낸다
            if (isCurrent() && publication.source === Track.Source.ScreenShare)
              void runExclusive(disconnect).catch(() => undefined);
          })
          .on(RoomEvent.TrackSubscribed, (track) => {
            attachAudio(track);
            sync();
          })
          .on(RoomEvent.TrackUnsubscribed, (track) => {
            detachAudio(track);
            sync();
          })
          .on(RoomEvent.Disconnected, (reason) => {
            if (!isCurrent()) return;

            const leftChannelId = channelIdRef.current;
            const wasHost = isHostRef.current;
            const endReason = toEndReason(reason);

            clearRoom();
            dispatch({ type: 'FORCE_ENDED', reason: endReason });

            if (leftChannelId === null) return;

            if (endReason === 'host-ended') markLiveEnded(leftChannelId);
            else
              void notifyLeave(leftChannelId, wasHost).catch(() => undefined);
          });

        await room.connect(session.livekit_url, session.token);
        roomRef.current = room;

        // 같은 join이라도 호스트 재입장이면 publish 토큰이 온다
        const localUserId = Number.parseInt(room.localParticipant.identity, 10);
        const isHost =
          intent !== 'watch' || localUserId === session.host_user_id;

        isHostRef.current = isHost;

        for (const track of screenTracks)
          await room.localParticipant.publishTrack(track);
        screenTracks = [];

        if (!room.canPlaybackAudio) await room.startAudio();
        applyRemoteVolume(room, audioEnabledRef.current);

        dispatch({
          type: 'CONNECTED',
          sessionId: session.session_id,
          role: isHost ? 'host' : 'viewer',
          hostUserId: isHost
            ? Number.isNaN(localUserId)
              ? null
              : localUserId
            : session.host_user_id,
        });
        sync();

        await queryClient.invalidateQueries({
          queryKey: liveQueries.status(nextChannelId).queryKey,
        });
      } catch (error) {
        clearRoom();
        dispatch({ type: 'CONNECT_FAILED' });

        screenTracks.forEach((track) => track.stop());
        await room?.disconnect();

        if (sessionStarted)
          await notifyLeave(nextChannelId, intent !== 'watch').catch(
            () => undefined,
          );
        else
          await queryClient.invalidateQueries({
            queryKey: liveQueries.status(nextChannelId).queryKey,
          });

        throw error;
      }
    },
    [
      clearRoom,
      disconnect,
      markLiveEnded,
      notifyLeave,
      queryClient,
      runExclusive,
    ],
  );

  const goLive = useCallback(
    (nextChannelId: number, options?: { resume?: boolean }) =>
      runExclusive(() =>
        connect(nextChannelId, options?.resume ? 'resume' : 'start'),
      ),
    [connect, runExclusive],
  );

  const watch = useCallback(
    (nextChannelId: number) =>
      runExclusive(() => connect(nextChannelId, 'watch')),
    [connect, runExclusive],
  );

  const leave = useCallback(
    () => runExclusive(disconnect),
    [disconnect, runExclusive],
  );

  const dismiss = useCallback(() => dispatch({ type: 'DISMISS' }), []);

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

  const channelId = getLiveChannelId(state);

  const value = useMemo(
    () => ({
      state,
      channelId,
      participants,
      screenShareTrack,
      audioEnabled,
      goLive,
      watch,
      leave,
      dismiss,
      toggleAudio,
    }),
    [
      audioEnabled,
      channelId,
      dismiss,
      goLive,
      leave,
      participants,
      screenShareTrack,
      state,
      toggleAudio,
      watch,
    ],
  );

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
}
