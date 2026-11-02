'use client';

import { useEffect, useState } from 'react';

function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  if (hours > 0)
    return `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`;

  return `${minutes}:${seconds}`;
}

// 시작 시각부터 지난 시간을 1초마다 갱신해 "m:ss" 또는 "h:mm:ss"로 돌려준다
export function useElapsedTime(
  startedAt: string | null | undefined,
): string | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, [startedAt]);

  if (!startedAt) return null;

  const start = Date.parse(startedAt);
  if (Number.isNaN(start)) return null;

  // 서버와 내 PC 시계가 조금 어긋나도 음수로 보이지 않게 한다
  return formatElapsed(Math.max(0, Math.floor((now - start) / 1000)));
}
