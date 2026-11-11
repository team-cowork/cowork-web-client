'use client';

import { type RefObject, useCallback, useRef, useState } from 'react';

import { type Room } from 'livekit-client';

import { applyRemoteVolume } from '@/shared/lib/livekit-room';

// 다른 참가자 소리를 켜고 끈다. 나중에 들어온 참가자나 새 트랙에도 같은 음량을
// 적용할 수 있게 이벤트 핸들러가 읽을 ref도 함께 돌려준다
export function useRemoteAudioToggle(roomRef: RefObject<Room | null>) {
  const audioEnabledRef = useRef(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const toggleAudio = useCallback(() => {
    const next = !audioEnabled;

    audioEnabledRef.current = next;
    setAudioEnabled(next);

    if (roomRef.current) applyRemoteVolume(roomRef.current, next);
  }, [audioEnabled, roomRef]);

  return { audioEnabled, audioEnabledRef, toggleAudio };
}
