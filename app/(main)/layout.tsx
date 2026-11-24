import { type ReactNode } from 'react';

import { FileDropGuard } from './_ui/file-drop-guard';
import { MainSidebar } from './_ui/main-sidebar';
import { LiveSessionProvider } from '@/features/live-session/model/live-session-provider';
import { VoiceSessionProvider } from '@/features/voice-session/model/voice-session-provider';
import { LiveMiniPlayer } from '@/widgets/live-mini-player/ui/live-mini-player';
import { LiveVoiceGuard } from '@/widgets/live-voice-guard/ui/live-voice-guard';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <VoiceSessionProvider>
      <LiveSessionProvider>
        <div className="flex h-dvh overflow-hidden">
          <MainSidebar />
          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
        <LiveMiniPlayer />
        <LiveVoiceGuard />
        <FileDropGuard />
      </LiveSessionProvider>
    </VoiceSessionProvider>
  );
}
