import { type ReactNode } from 'react';

import { IconButton } from '@/shared/ui/icon-button';
import { ArrowLeftIcon } from '@/shared/ui/icons/arrow-left-icon';

export interface MeetingNotePageHeaderProps {
  title: string;
  description?: string;
  onBack: () => void;
  backLabel: string;
  actions?: ReactNode;
}

/** 회의록 작성·템플릿 화면의 상단 바. 채널 헤더 대신 쓴다. */
export function MeetingNotePageHeader({
  title,
  description,
  onBack,
  backLabel,
  actions,
}: MeetingNotePageHeaderProps) {
  return (
    <header className="flex min-h-14 shrink-0 items-center gap-2 px-4 py-2">
      <IconButton
        aria-label={backLabel}
        size="S"
        variant="clear"
        onClick={onBack}
        className="-ml-1 text-on-surface-variant"
      >
        <ArrowLeftIcon />
      </IconButton>
      <div className="min-w-0 flex-1">
        <h1 className="truncate typography-label-medium text-on-surface">
          {title}
        </h1>
        {description && (
          <p className="truncate typography-subtext-small text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
