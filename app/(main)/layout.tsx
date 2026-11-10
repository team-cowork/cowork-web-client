import { type ReactNode } from 'react';

import { MainSidebar } from './_ui/main-sidebar';
import { LiveSessionProvider } from '@/features/live-session/model/live-session-provider';
import { VoiceSessionProvider } from '@/features/voice-session/model/voice-session-provider';
import { LiveMiniPlayer } from '@/widgets/live-mini-player/ui/live-mini-player';
import { LiveVoiceGuard } from '@/widgets/live-voice-guard/ui/live-voice-guard';
import { TeamRail } from '@/widgets/team-rail/ui/team-rail';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <VoiceSessionProvider>
      <LiveSessionProvider>
        <div className="flex h-screen overflow-hidden">
          <TeamRail />
          <MainSidebar />
          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
        <LiveMiniPlayer />
        <LiveVoiceGuard />
      </LiveSessionProvider>
    </VoiceSessionProvider>
  );
}
