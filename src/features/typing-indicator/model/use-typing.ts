'use client';

import { useEffect, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { userQueries } from '@/entities/user/api/user-queries';
import { getChatSocket } from '@/shared/api/chat-socket';

// 서버가 타이핑 이벤트 횟수를 제한하므로 입력하는 동안 이 간격으로만 다시 알린다.
const TYPING_REPEAT_MS = 3000;
// 이 시간 동안 입력이 없으면 입력을 멈춘 것으로 본다.
const TYPING_IDLE_MS = 4000;
// stop 이벤트를 놓쳐도 상대의 입력 중 표시가 남지 않게 지운다.
const TYPING_EXPIRE_MS = 6000;

interface TypingState {
  channelId: number;
  userId: number;
  isTyping: boolean;
}

/**
 * 채널에서 다른 사람이 입력 중인지 받고, 내가 입력 중임을 알린다.
 * 같은 채널 room에 이미 참가해 있어야 이벤트를 주고받을 수 있다.
 */
export function useTyping(channelId: number) {
  const { data: me } = useQuery(userQueries.me());
  const myId = me?.id;
  const [typingUserIds, setTypingUserIds] = useState<number[]>([]);
  const lastStartRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = getChatSocket();
    const expireTimers = new Map<number, ReturnType<typeof setTimeout>>();

    const remove = (userId: number) => {
      clearTimeout(expireTimers.get(userId));
      expireTimers.delete(userId);
      setTypingUserIds((prev) => prev.filter((id) => id !== userId));
    };

    const handleTyping = ({
      channelId: target,
      userId,
      isTyping,
    }: TypingState) => {
      if (target !== channelId || userId === myId) return;
      if (!isTyping) {
        remove(userId);
        return;
      }

      clearTimeout(expireTimers.get(userId));
      expireTimers.set(
        userId,
        setTimeout(() => remove(userId), TYPING_EXPIRE_MS),
      );
      setTypingUserIds((prev) =>
        prev.includes(userId) ? prev : [...prev, userId],
      );
    };

    socket.on('typing', handleTyping);

    return () => {
      socket.off('typing', handleTyping);
      expireTimers.forEach((timer) => clearTimeout(timer));
      setTypingUserIds([]);
    };
  }, [channelId, myId]);

  const stop = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
    if (lastStartRef.current === 0) return;

    lastStartRef.current = 0;
    getChatSocket().emit('typing:stop', { channelId });
  };

  // 채널을 떠날 때 입력 중이었다면 멈췄다고 알린다.
  useEffect(
    () => () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (lastStartRef.current !== 0) {
        getChatSocket().emit('typing:stop', { channelId });
      }
    },
    [channelId],
  );

  const notify = () => {
    const now = Date.now();
    if (now - lastStartRef.current > TYPING_REPEAT_MS) {
      lastStartRef.current = now;
      getChatSocket().emit('typing:start', { channelId });
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(stop, TYPING_IDLE_MS);
  };

  return { typingUserIds, notify, stop };
}
