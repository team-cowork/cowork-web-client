'use client';

import { type MouseEvent, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useScrollLock } from '@/shared/lib/use-scroll-lock';
import { ChevronLeftIcon } from '@/shared/ui/icons/chevron-left-icon';
import { ChevronRightIcon } from '@/shared/ui/icons/chevron-right-icon';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { DownloadIcon } from '@/shared/ui/icons/download-icon';

export interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  /** 보여 줄 이미지 주소. 아직 받는 중이면 비워 둔다. */
  src?: string;
  alt: string;
  /** 위쪽에 보여 줄 이름(예: 파일 이름) */
  caption?: string;
  /** 주소를 받지 못했을 때 */
  error?: boolean;
  /** 여러 장을 넘겨 볼 때 현재 순번과 전체 수 */
  position?: {
    index: number;
    count: number;
    onChange: (index: number) => void;
  };
  /** 있으면 다운로드 버튼을 보여준다 */
  onDownload?: () => void;
}

const TOOL_BUTTON_CLASS =
  'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none disabled:cursor-default disabled:opacity-30';

/**
 * 화면 전체를 덮는 이미지 뷰어.
 * 배경·`Esc`·닫기 버튼으로 닫고, 여러 장이면 좌우 버튼과 방향키로 넘긴다.
 * 이미지를 누르면 화면 맞춤과 원본 크기를 오간다.
 */
export function ImageViewer({
  open,
  onClose,
  src,
  alt,
  caption,
  error = false,
  position,
  onDownload,
}: ImageViewerProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useScrollLock(open);

  const hasPrev = position !== undefined && position.index > 0;
  const hasNext = position !== undefined && position.index < position.count - 1;
  const move = (offset: number) =>
    position?.onChange(
      Math.min(Math.max(position.index + offset, 0), position.count - 1),
    );

  // 이미지 밖의 빈 곳(data-backdrop)을 누르면 닫는다.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.dataset.backdrop !== undefined
    ) {
      onClose();
    }
  };

  return (
    <dialog
      ref={ref}
      aria-label={caption ?? alt}
      onClose={onClose}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' && hasPrev) move(-1);
        if (event.key === 'ArrowRight' && hasNext) move(1);
      }}
      className={cn(
        'm-0 h-dvh max-h-none w-dvw max-w-none flex-col bg-transparent p-0 text-white backdrop:bg-black/85',
        open ? 'flex' : 'hidden',
      )}
    >
      <div className="flex shrink-0 items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          {caption && (
            <p className="truncate typography-label-small">{caption}</p>
          )}
          {position && position.count > 1 && (
            <p className="shrink-0 typography-label-x-small text-white/70">
              {position.index + 1} / {position.count}
            </p>
          )}
        </div>
        {onDownload && (
          <button
            type="button"
            aria-label="다운로드"
            title="다운로드"
            onClick={onDownload}
            className={TOOL_BUTTON_CLASS}
          >
            <DownloadIcon size={20} />
          </button>
        )}
        <button
          type="button"
          aria-label="닫기"
          title="닫기"
          autoFocus
          onClick={onClose}
          className={TOOL_BUTTON_CLASS}
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <div
        data-backdrop
        className="relative flex min-h-0 flex-1 items-center justify-center px-16 pb-6"
      >
        {error ? (
          <ViewerMessage>이미지를 불러오지 못했어요</ViewerMessage>
        ) : src ? (
          // 이미지가 바뀌면 확대 상태와 오류 상태를 처음부터 다시 잡는다.
          <ViewerImage key={src} src={src} alt={alt} />
        ) : (
          <span className="size-48 animate-pulse rounded-xl bg-white/10" />
        )}

        {position && position.count > 1 && (
          <>
            <button
              type="button"
              aria-label="이전 이미지"
              disabled={!hasPrev}
              onClick={() => move(-1)}
              className={cn(
                TOOL_BUTTON_CLASS,
                'absolute top-1/2 left-3 -translate-y-1/2',
              )}
            >
              <ChevronLeftIcon size={22} />
            </button>
            <button
              type="button"
              aria-label="다음 이미지"
              disabled={!hasNext}
              onClick={() => move(1)}
              className={cn(
                TOOL_BUTTON_CLASS,
                'absolute top-1/2 right-3 -translate-y-1/2',
              )}
            >
              <ChevronRightIcon size={22} />
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}

function ViewerImage({ src, alt }: { src: string; alt: string }) {
  const [zoomed, setZoomed] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) return <ViewerMessage>이미지를 불러오지 못했어요</ViewerMessage>;

  /* eslint-disable @next/next/no-img-element -- 서명된 일회성 주소라 이미지 최적화 서버를 거치지 않는다. */
  const image = (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      onClick={() => setZoomed((value) => !value)}
      className={cn(
        zoomed
          ? 'max-w-none cursor-zoom-out'
          : 'max-h-full max-w-full cursor-zoom-in object-contain',
      )}
    />
  );
  /* eslint-enable @next/next/no-img-element */

  if (!zoomed) {
    return (
      <div data-backdrop className="flex size-full items-center justify-center">
        {image}
      </div>
    );
  }

  return (
    <div data-backdrop className="size-full overflow-auto">
      <div
        data-backdrop
        className="flex min-h-full w-max min-w-full items-center justify-center"
      >
        {image}
      </div>
    </div>
  );
}

function ViewerMessage({ children }: { children: string }) {
  return (
    <p role="alert" className="typography-subtext-large text-white/80">
      {children}
    </p>
  );
}
