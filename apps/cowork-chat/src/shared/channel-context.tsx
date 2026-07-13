import { createContext, useContext } from 'react';

export interface ActiveChannel {
  id: string;
  name: string;
  description?: string;
}

const ChannelContext = createContext<ActiveChannel | undefined>(undefined);

export const ChannelProvider = ChannelContext.Provider;

// 셸이 없는 단독 실행(standalone dev) 시 기본 채널로 폴백.
export function useActiveChannel(): ActiveChannel {
  return useContext(ChannelContext) ?? { id: 'backend', name: '백엔드', description: '백엔드 API 개발 · PR/이슈 논의' };
}
