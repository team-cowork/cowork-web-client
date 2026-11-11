import { getUserDisplayName } from '@/entities/user/lib/user-display';
import { type User } from '@/entities/user/model/user';
import { type VoiceChannelParticipant } from '@/features/voice-session/model/use-voice-channel-participants';
import { cn } from '@/shared/lib/cn';
import { type RoomCamera } from '@/shared/lib/livekit-room';
import { Avatar } from '@/shared/ui/avatar';
import { TrackVideo } from '@/shared/ui/track-video';

export interface LiveFocusFooterProps {
  participants: VoiceChannelParticipant[];
  userById: Map<number, User>;
  cameraByUserId: Map<number, RoomCamera>;
}

// 방송을 크게 보는 동안에도 음성 참가자와 말하는 사람을 화면 아래에 작게 보여 준다
export function LiveFocusFooter({
  participants,
  userById,
  cameraByUserId,
}: LiveFocusFooterProps) {
  return (
    <ul className="flex shrink-0 justify-center gap-3 overflow-x-auto">
      {participants.map((participant) => {
        const user =
          participant.userId === null
            ? undefined
            : userById.get(participant.userId);
        const camera =
          participant.userId === null
            ? undefined
            : cameraByUserId.get(participant.userId);
        const name = getUserDisplayName(
          user,
          `#${participant.userId ?? participant.key}`,
        );

        return (
          <li key={participant.key} title={name}>
            <span
              className={cn(
                'relative flex h-20 w-36 items-center justify-center overflow-hidden rounded-xl border-2 bg-surface-container',
                participant.speaking
                  ? 'border-cowork-green-500'
                  : 'border-transparent',
              )}
            >
              {camera ? (
                <TrackVideo
                  track={camera.track}
                  fit="cover"
                  mirrored={camera.isLocal}
                  className="rounded-none"
                />
              ) : (
                <Avatar
                  src={user?.profile_image_url ?? undefined}
                  name={user?.name ?? name}
                  size={40}
                  shape="circle"
                />
              )}
              <span className="absolute bottom-1 left-1.5 max-w-[calc(100%-0.75rem)] truncate rounded bg-black/60 px-1.5 typography-subtext-small text-white">
                {name}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
