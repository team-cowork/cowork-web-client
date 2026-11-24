import { type MouseEvent, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Avatar, type AvatarTone } from '@/shared/ui/avatar';

export interface MessageItemProps {
  author: string;
  timestamp: string;
  content: ReactNode;
  avatarSrc?: string;
  tone?: AvatarTone;
  /** 작성자·시각 줄 위에 붙는 답글 원본 인용 */
  quote?: ReactNode;
  /** 시각 뒤에 붙는 보조 표시(예: 수정됨) */
  meta?: ReactNode;
  /** 본문 아래 이모지 반응 */
  reactions?: ReactNode;
  /** 본문 아래 상태 표시(예: 전송 실패) */
  footer?: ReactNode;
  /** 마우스를 올리거나 포커스가 들어오면 오른쪽 위에 뜨는 도구 모음 */
  actions?: ReactNode;
  /** 도구 모음을 마우스와 관계없이 계속 보여줄지(예: 메뉴가 열린 동안) */
  actionsVisible?: boolean;
  /** 전송 중처럼 아직 확정되지 않은 메시지를 흐리게 표시 */
  dimmed?: boolean;
  /** 있으면 작성자 아바타·이름을 눌러 프로필을 연다. 누른 요소 옆에 띄울 수 있게 넘긴다. */
  onAuthorClick?: (anchor: HTMLElement) => void;
  compact?: boolean;
  className?: string;
}

// 메시지 줄을 누르면 스레드가 열리므로 작성자 클릭은 위로 올리지 않는다.
function authorClickHandler(onAuthorClick: (anchor: HTMLElement) => void) {
  return (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onAuthorClick(event.currentTarget);
  };
}

export function MessageItem({
  author,
  timestamp,
  content,
  avatarSrc,
  tone,
  quote,
  meta,
  reactions,
  footer,
  actions,
  actionsVisible = false,
  dimmed = false,
  onAuthorClick,
  compact = false,
  className,
}: MessageItemProps) {
  const avatar = (
    <Avatar
      src={avatarSrc}
      name={author}
      size={44}
      shape="circle"
      tone={tone}
      className="shrink-0"
    />
  );

  return (
    <div
      className={cn(
        'group relative flex items-start px-4',
        compact ? 'py-0.5' : 'pt-1 pb-0.5',
        className,
      )}
    >
      {compact ? (
        <span className="w-11 shrink-0 pt-0.5 text-center typography-subtext-small text-on-surface-variant opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 in-focus-visible:opacity-100">
          <span className="sr-only">{author} </span>
          {timestamp}
        </span>
      ) : (
        <div className="h-0 shrink-0">
          {onAuthorClick ? (
            <button
              type="button"
              aria-label={`${author} 프로필 보기`}
              onClick={authorClickHandler(onAuthorClick)}
              className="flex cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              {avatar}
            </button>
          ) : (
            avatar
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-5">
        {quote}
        {!compact && (
          <p className="typography-label-x-small text-on-surface-variant">
            {author &&
              (onAuthorClick ? (
                <>
                  <button
                    type="button"
                    onClick={authorClickHandler(onAuthorClick)}
                    className="cursor-pointer hover:text-on-surface hover:underline"
                  >
                    {author}
                  </button>
                  {' · '}
                </>
              ) : (
                <>{author} · </>
              ))}
            {timestamp}
            {meta && <> {meta}</>}
          </p>
        )}
        <div
          className={cn(
            'typography-subtext-large break-words text-on-surface',
            dimmed && 'opacity-60',
          )}
        >
          {content}
        </div>
        {compact && meta && (
          <p className="typography-label-x-small text-on-surface-variant">
            {meta}
          </p>
        )}
        {reactions}
        {footer}
      </div>
      {actions && (
        <div
          className={cn(
            'absolute right-4 z-10 flex items-center gap-0.5 rounded-[10px] border border-outline-variant bg-surface-container-low p-0.5 shadow-sm transition-opacity',
            compact ? '-top-1' : '-top-3',
            actionsVisible
              ? 'opacity-100'
              : 'pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100',
          )}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
