'use client';

import { useEffect } from 'react';

import { useLiveSession } from '@/features/live-session/model/live-session-provider';
import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';

// 디스코드처럼 방송은 같은 채널 음성에 참여해 있을 때만 유지한다.
// 나가기 버튼뿐 아니라 연결 끊김·채널 이동으로 음성이 바뀌어도 방송을 끝낸다.
export function LiveVoiceGuard() {
  const live = useLiveSession();
  const voice = useVoiceSession();

  const isBroadcasting = live.state.status === 'broadcasting';
  const hasVoiceInLiveChannel =
    voice.status === 'connected' && voice.channelId === live.channelId;

  const { leave } = live;

  useEffect(() => {
    if (!isBroadcasting || hasVoiceInLiveChannel) return;

    void leave().catch(() => undefined);
  }, [hasVoiceInLiveChannel, isBroadcasting, leave]);

  return null;
}
