'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useQuery } from '@tanstack/react-query';

import { userQueries } from '@/entities/user/api/user-queries';
import { type User } from '@/entities/user/model/user';
import { ProfileBanner } from '@/entities/user/ui/profile-banner';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { Badge } from '@/shared/ui/badge';
import { ImageViewer } from '@/shared/ui/image-viewer';

const POPOVER_WIDTH = 300;
const GAP = 8;
const VIEWPORT_MARGIN = 8;

export interface UserProfilePopoverProps {
  userId: number;
  /** 누른 아바타·이름. 이 요소 옆에 띄운다. */
  anchor: HTMLElement;
  onClose: () => void;
}

interface Position {
  top: number;
  left: number;
}

/** 오른쪽에 띄우고, 자리가 없으면 왼쪽에 띄운다. 위아래는 화면 안에 들어오게 맞춘다. */
function placeNextTo(anchor: HTMLElement, popover: HTMLElement): Position {
  const rect = anchor.getBoundingClientRect();
  const height = popover.offsetHeight;
  const fitsRight =
    rect.right + GAP + POPOVER_WIDTH <= window.innerWidth - VIEWPORT_MARGIN;
  const left = fitsRight
    ? rect.right + GAP
    : Math.max(VIEWPORT_MARGIN, rect.left - GAP - POPOVER_WIDTH);
  const top = Math.min(
    Math.max(VIEWPORT_MARGIN, rect.top),
    window.innerHeight - height - VIEWPORT_MARGIN,
  );

  return { top: Math.max(VIEWPORT_MARGIN, top), left };
}

// 서버 코드값(예: GENERAL_STUDENT)인 `roles`·`student_role`은 사람이 읽을 이름이 아니라 보여 주지 않는다.
function buildChips(user: User): string[] {
  return [
    user.specialty,
    user.student_number && `학번 ${user.student_number}`,
    user.github_id && `GitHub @${user.github_id}`,
  ].filter((chip): chip is string => Boolean(chip));
}

/**
 * 다른 사용자의 프로필을 누른 자리 옆에 카드로 띄운다.
 * 바깥을 누르거나 `Esc`로 닫고, 프로필 사진을 누르면 이미지 뷰어로 크게 본다.
 */
export function UserProfilePopover({
  userId,
  anchor,
  onClose,
}: UserProfilePopoverProps) {
  const { data: user, isError } = useQuery(userQueries.detail(userId));
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // 내용이 바뀌면 높이도 바뀌므로 그때마다 다시 자리를 잡는다.
  useLayoutEffect(() => {
    if (ref.current) setPosition(placeNextTo(anchor, ref.current));
  }, [anchor, user, isError]);

  // 자리를 잡기 전에는 `invisible`이라 포커스가 가지 않으므로, 자리를 잡은 뒤에 옮긴다.
  const placed = position !== null;
  useEffect(() => {
    if (placed) ref.current?.focus();
  }, [placed]);

  // 뷰어가 떠 있는 동안 `Esc`는 뷰어만 닫는다.
  useEffect(() => {
    if (viewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onClose();
      anchor.focus();
    };
    const handleResize = () => onClose();

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [anchor, onClose, viewerOpen]);

  const imageUrl = user?.profile_image_url ?? undefined;

  return createPortal(
    <>
      <div aria-hidden className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-label={user ? `${user.name} 프로필` : '프로필'}
        tabIndex={-1}
        style={{
          width: POPOVER_WIDTH,
          top: position?.top ?? 0,
          left: position?.left ?? 0,
        }}
        className={
          position
            ? 'fixed z-50 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-xl outline-none'
            : 'invisible fixed z-50'
        }
      >
        {user ? (
          <ProfileContent
            user={user}
            onAvatarClick={imageUrl ? () => setViewerOpen(true) : undefined}
          />
        ) : (
          <>
            <ProfileBanner className="h-24" />
            <div className="px-4 pt-3 pb-5">
              {isError ? (
                <p className="typography-subtext-medium text-on-surface-variant">
                  프로필을 불러오지 못했습니다
                </p>
              ) : (
                <span className="block h-24 animate-pulse rounded-xl bg-surface-container" />
              )}
            </div>
          </>
        )}
      </div>

      {viewerOpen && user && imageUrl && (
        <ImageViewer
          open
          onClose={() => setViewerOpen(false)}
          src={imageUrl}
          alt={`${user.name} 프로필 사진`}
          caption={user.nickname ?? user.name}
        />
      )}
    </>,
    document.body,
  );
}

function ProfileContent({
  user,
  onAvatarClick,
}: {
  user: User;
  onAvatarClick?: () => void;
}) {
  const chips = buildChips(user);
  const handle = user.nickname ?? user.github_id;
  const avatar = (
    <UserAvatar
      user={user}
      size={80}
      ringClassName="ring-surface-container-low"
      loading="eager"
    />
  );

  return (
    <>
      <ProfileBanner color={user.banner_color} className="h-24" />
      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="-mt-12 w-fit rounded-full bg-surface-container-low p-1.5">
          {onAvatarClick ? (
            <button
              type="button"
              aria-label={`${user.name} 프로필 사진 크게 보기`}
              onClick={onAvatarClick}
              className="flex cursor-zoom-in rounded-full transition-[filter] hover:brightness-90 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              {avatar}
            </button>
          ) : (
            avatar
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-[1.25rem] leading-tight font-bold text-on-surface">
            {user.name}
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {handle && (
              <span className="truncate typography-subtext-medium text-on-surface-variant">
                @{handle}
              </span>
            )}
            {user.major && <Badge color="green">{user.major}</Badge>}
          </div>
        </div>

        {user.status_message && (
          <p className="rounded-lg bg-surface-container px-3 py-2 typography-subtext-medium text-on-surface">
            {user.status_message}
          </p>
        )}

        {user.description && (
          <p className="typography-subtext-large break-words text-on-surface">
            {user.description}
          </p>
        )}

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="flex items-center rounded-lg border border-outline-variant px-2.5 py-1 typography-subtext-small font-medium text-on-surface-variant"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
