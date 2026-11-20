'use client';

import { useChannelMessageEvents } from '@/entities/message/model/use-channel-message-events';
import { useMarkLatestRead } from '@/features/channel-read/model/use-mark-latest-read';

/**
 * 음성 채널을 보는 동안 활동 기록을 받아 읽음 처리한다. 화면에는 아무것도 그리지 않는다.
 * 활동 기록 패널을 닫거나 멤버 패널로 바꿔도 읽음 처리가 이어지게 채널 화면에 둔다.
 */
export function VoiceLogReader({ channelId }: { channelId: number }) {
  useChannelMessageEvents(channelId);
  useMarkLatestRead(channelId);

  return null;
}
