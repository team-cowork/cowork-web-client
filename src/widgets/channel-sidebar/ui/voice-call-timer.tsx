'use client';

import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';
import { useElapsedTime } from '@/shared/lib/use-elapsed-time';

export interface VoiceCallTimerProps {
  channelId: number;
}

// 디스코드처럼 내가 연결된 음성 채널 옆에 들어온 뒤 지난 시간을 보여 준다
export function VoiceCallTimer({ channelId }: VoiceCallTimerProps) {
  const voice = useVoiceSession();
  const isConnectedHere =
    voice.channelId === channelId && voice.status === 'connected';
  const elapsed = useElapsedTime(isConnectedHere ? voice.connectedAt : null);

  if (!elapsed) return null;

  return (
    <span className="typography-subtext-small text-cowork-green-500 tabular-nums">
      {elapsed}
    </span>
  );
}
