'use client';

import { type PointerEvent, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { liveQueries } from '@/entities/live/api/live-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { useLiveSession } from '@/features/live-session/model/live-session-provider';
import { LiveScreenView } from '@/features/live-session/ui/live-screen-view';
import { cn } from '@/shared/lib/cn';
import { useElapsedTime } from '@/shared/lib/use-elapsed-time';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { channelPath } from '@/shared/model/paths';
import { MonitorIcon } from '@/shared/ui/icons/monitor-icon';

const EDGE_GAP = 8;
const DRAG_THRESHOLD = 4;
const ENDED_NOTICE_MS = 5000;

interface Position {
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

function clampToViewport(position: Position, element: HTMLElement): Position {
  const maxX = window.innerWidth - element.offsetWidth - EDGE_GAP;
  const maxY = window.innerHeight - element.offsetHeight - EDGE_GAP;

  return {
    x: Math.min(Math.max(position.x, EDGE_GAP), Math.max(maxX, EDGE_GAP)),
    y: Math.min(Math.max(position.y, EDGE_GAP), Math.max(maxY, EDGE_GAP)),
  };
}

// 디스코드처럼 방송 채널을 벗어나도 작은 화면으로 방송을 계속 보여 준다
export function LiveMiniPlayer() {
  const router = useRouter();
  const live = useLiveSession();
  const { channelId: routeChannelId } = useRouteIds();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [dragging, setDragging] = useState(false);

  const { state } = live;
  const active =
    state.status === 'broadcasting' || state.status === 'watching'
      ? state
      : null;
  // 다른 화면에 있는 동안 끝난 방송은 여기서 잠깐 알리고 정리한다
  const endedElsewhere =
    state.status === 'ended' && routeChannelId !== state.channelId
      ? state
      : null;
  const hostUserId = active?.hostUserId ?? endedElsewhere?.hostUserId ?? null;

  const channel = useQuery({
    ...channelQueries.detail(active?.channelId ?? 0),
    enabled: active !== null,
  });
  const liveStatus = useQuery({
    ...liveQueries.status(active?.channelId ?? 0),
    enabled: active !== null,
  });
  const elapsed = useElapsedTime(
    active && liveStatus.data?.live ? liveStatus.data.started_at : null,
  );
  const host = useQuery({
    ...userQueries.detail(hostUserId ?? 0),
    enabled: hostUserId !== null,
  });
  const hostName =
    host.data?.nickname ?? host.data?.name ?? `#${hostUserId ?? ''}`;

  const { dismiss } = live;

  useEffect(() => {
    if (!endedElsewhere) return;

    const timer = window.setTimeout(dismiss, ENDED_NOTICE_MS);

    return () => window.clearTimeout(timer);
  }, [dismiss, endedElsewhere]);

  useEffect(() => {
    function handleResize() {
      const element = containerRef.current;
      if (!element) return;

      setPosition((prev) => (prev ? clampToViewport(prev, element) : prev));
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const positionStyle = position
    ? { left: position.x, top: position.y, right: 'auto' }
    : undefined;

  if (endedElsewhere)
    return (
      <div
        role="status"
        style={positionStyle}
        className="fixed top-16 right-4 z-40 flex w-80 items-center gap-3 rounded-xl bg-cowork-neutral-900 p-3 shadow-2xl"
      >
        <MonitorIcon size={20} className="shrink-0 text-cowork-neutral-300" />
        <p className="min-w-0 flex-1 truncate typography-subtext-medium text-white">
          {endedElsewhere.role === 'viewer' &&
          endedElsewhere.reason === 'host-ended'
            ? `${hostName}님의 방송이 종료되었습니다`
            : '방송이 종료되었습니다'}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 cursor-pointer typography-subtext-small text-cowork-neutral-300 underline hover:text-white"
        >
          닫기
        </button>
      </div>
    );

  if (active === null || routeChannelId === active.channelId) return null;

  const isHost = active.status === 'broadcasting';
  const viewerCount = live.participants.filter(
    (participant) => participant.userId !== active.hostUserId,
  ).length;
  const teamId = channel.data?.teamId ?? null;

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;

    const rect = event.currentTarget.getBoundingClientRect();

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      // 임계값을 넘은 뒤에만 캡처해야 단순 클릭이 버튼에 그대로 전달된다
      drag.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    setPosition(
      clampToViewport(
        { x: drag.originX + dx, y: drag.originY + dy },
        event.currentTarget,
      ),
    );
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    setDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={positionStyle}
      className={cn(
        'group fixed top-16 right-4 z-40 w-80 touch-none overflow-hidden rounded-xl bg-black shadow-2xl select-none',
        // 끄는 동안에는 버튼 위를 지나가도 움켜쥔 손을 유지한다
        dragging && 'cursor-grabbing [&_*]:cursor-grabbing',
      )}
    >
      <button
        type="button"
        aria-label="방송 중인 채널로 이동"
        disabled={teamId === null}
        onClick={() => {
          if (teamId !== null)
            router.push(channelPath(teamId, active.channelId));
        }}
        className="block aspect-video w-full cursor-grab"
      >
        {live.screenShareTrack ? (
          <LiveScreenView
            track={live.screenShareTrack}
            className="pointer-events-none rounded-none"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-cowork-neutral-300">
            <MonitorIcon size={32} />
          </span>
        )}
      </button>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent p-2">
        <span className="shrink-0 rounded bg-error px-1.5 py-0.5 text-[0.625rem] font-bold text-on-error">
          LIVE
        </span>
        {elapsed && (
          <span className="shrink-0 typography-subtext-small text-white tabular-nums">
            {elapsed}
          </span>
        )}
        <span className="min-w-0 truncate typography-subtext-small text-white">
          {isHost ? '내 화면' : `${hostName}님의 화면`}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <span className="min-w-0 flex-1 truncate typography-subtext-small text-cowork-neutral-300">
          {channel.data ? `${channel.data.name} · ` : ''}시청자 {viewerCount}명
        </span>
        <button
          type="button"
          onClick={() => void live.leave().catch(() => undefined)}
          className="h-7 shrink-0 cursor-pointer rounded-full bg-error px-3 typography-subtext-small text-on-error hover:bg-cowork-red-800"
        >
          {isHost ? '방송 종료' : '나가기'}
        </button>
      </div>
    </div>
  );
}
