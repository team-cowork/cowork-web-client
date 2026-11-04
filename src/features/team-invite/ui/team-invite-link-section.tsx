'use client';

import { useState } from 'react';

import { useCreateTeamInvite } from '@/features/team-invite/model/use-create-team-invite';
import {
  INVITE_DURATIONS,
  INVITE_DURATION_LABEL,
  type InviteDuration,
} from '@/entities/team/model/team';
import { Button } from '@/shared/ui/button';
import { CopyIcon } from '@/shared/ui/icons/copy-icon';
import { SegmentedControl } from '@/shared/ui/segmented-control';

export function TeamInviteLinkSection({ teamId }: { teamId: number }) {
  const [duration, setDuration] = useState<InviteDuration>('7d');
  const [copied, setCopied] = useState(false);
  const createInvite = useCreateTeamInvite(teamId);

  const handleCopy = async () => {
    if (!createInvite.data) return;

    await navigator.clipboard.writeText(createInvite.data.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2.5 border-t border-outline-variant pt-4">
      <h3 className="typography-label-x-small text-on-surface-variant">
        초대 링크로 초대
      </h3>

      {createInvite.data ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
              {createInvite.data.inviteCode}
            </span>
            <button
              type="button"
              aria-label="초대 코드 복사"
              onClick={handleCopy}
              className="flex shrink-0 cursor-pointer items-center gap-1 text-on-surface-variant hover:text-on-surface"
            >
              <CopyIcon size={16} />
              <span className="typography-subtext-medium">
                {copied ? '복사됨' : '복사'}
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => createInvite.reset()}
            className="w-fit cursor-pointer typography-subtext-medium text-on-surface-variant hover:text-on-surface"
          >
            새 링크 만들기
          </button>
        </div>
      ) : (
        <>
          <SegmentedControl
            options={INVITE_DURATIONS.map((value) => ({
              label: INVITE_DURATION_LABEL[value],
              value,
            }))}
            value={duration}
            onChange={setDuration}
          />
          <Button
            type="button"
            variant="weak"
            color="neutral"
            disabled={createInvite.isPending}
            onClick={() => createInvite.mutate(duration)}
          >
            {createInvite.isPending ? '생성하는 중…' : '링크 생성'}
          </Button>
        </>
      )}

      {createInvite.isError && (
        <p className="typography-subtext-medium text-error">
          링크를 생성하지 못했어요. 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
