'use client';

import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cropToSquare } from '@/features/profile-image/lib/crop-image';
import { type ImageCrop } from '@/features/profile-image/model/profile-image-draft';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';

const VIEWPORT = 280;
const MAX_ZOOM = 4;
const KEY_STEP = 10;

export interface ProfileImageCropperProps {
  file: File;
  /** 다시 맞출 때 이전에 정한 영역 */
  initialCrop?: ImageCrop;
  onApply: (cropped: File, crop: ImageCrop) => void;
  onCancel: () => void;
}

interface LoadedImage {
  element: HTMLImageElement;
  url: string;
  width: number;
  height: number;
}

interface Offset {
  x: number;
  y: number;
}

/**
 * 프로필 사진의 위치와 크기를 정한다.
 * 원 안에 보이는 부분이 프로필 사진이 되고, 드래그로 옮기고 막대로 확대한다.
 */
export function ProfileImageCropper({
  file,
  initialCrop,
  onApply,
  onCancel,
}: ProfileImageCropperProps) {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [applying, setApplying] = useState(false);
  const drag = useRef<{ pointerX: number; pointerY: number } & Offset>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => {
      const width = element.naturalWidth;
      const height = element.naturalHeight;
      const base = VIEWPORT / Math.min(width, height);

      if (initialCrop) {
        const scale = VIEWPORT / initialCrop.size;
        setZoom(scale / base);
        setOffset({ x: -initialCrop.x * scale, y: -initialCrop.y * scale });
      } else {
        setZoom(1);
        setOffset({
          x: (VIEWPORT - width * base) / 2,
          y: (VIEWPORT - height * base) / 2,
        });
      }
      setImage({ element, url, width, height });
    };
    element.onerror = () => setFailed(true);
    element.src = url;

    return () => URL.revokeObjectURL(url);
  }, [file, initialCrop]);

  const base = image ? VIEWPORT / Math.min(image.width, image.height) : 1;
  const scale = base * zoom;

  // 원 밖으로 빈 곳이 보이지 않게 이미지가 항상 보이는 영역을 덮도록 막는다.
  const clamp = (next: Offset, nextScale = scale): Offset =>
    image
      ? {
          x: Math.min(0, Math.max(VIEWPORT - image.width * nextScale, next.x)),
          y: Math.min(0, Math.max(VIEWPORT - image.height * nextScale, next.y)),
        }
      : next;

  // 확대해도 가운데 보던 곳이 그대로 가운데 남게 한다.
  const changeZoom = (nextZoom: number) => {
    const nextScale = base * nextZoom;
    const centerX = (VIEWPORT / 2 - offset.x) / scale;
    const centerY = (VIEWPORT / 2 - offset.y) / scale;
    setZoom(nextZoom);
    setOffset(
      clamp(
        {
          x: VIEWPORT / 2 - centerX * nextScale,
          y: VIEWPORT / 2 - centerY * nextScale,
        },
        nextScale,
      ),
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      ...offset,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;

    setOffset(
      clamp({
        x: start.x + event.clientX - start.pointerX,
        y: start.y + event.clientY - start.pointerY,
      }),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, Offset> = {
      ArrowLeft: { x: KEY_STEP, y: 0 },
      ArrowRight: { x: -KEY_STEP, y: 0 },
      ArrowUp: { x: 0, y: KEY_STEP },
      ArrowDown: { x: 0, y: -KEY_STEP },
    };
    const move = moves[event.key];
    if (!move) return;

    event.preventDefault();
    setOffset(clamp({ x: offset.x + move.x, y: offset.y + move.y }));
  };

  const handleApply = async () => {
    if (!image) return;

    const crop: ImageCrop = {
      x: -offset.x / scale,
      y: -offset.y / scale,
      size: VIEWPORT / scale,
    };
    setApplying(true);
    try {
      onApply(await cropToSquare(image.element, crop, file), crop);
    } catch {
      setFailed(true);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal
      open
      onClose={onCancel}
      title="프로필 편집하기"
      footer={
        <>
          <Button variant="weak" color="neutral" onClick={onCancel}>
            취소
          </Button>
          <Button
            disabled={!image || failed || applying}
            onClick={() => void handleApply()}
          >
            적용
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        {failed ? (
          <p
            role="alert"
            className="py-10 typography-subtext-medium text-error"
          >
            이미지를 읽지 못했어요. 다른 사진을 골라 주세요.
          </p>
        ) : (
          <div
            role="application"
            aria-label="사진 위치. 드래그하거나 방향키로 옮겨요"
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onKeyDown={handleKeyDown}
            style={{ width: VIEWPORT, height: VIEWPORT }}
            className="relative cursor-grab touch-none overflow-hidden rounded-xl bg-surface-container select-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none active:cursor-grabbing"
          >
            {image && (
              // blob URL은 이미지 최적화 서버가 읽을 수 없어 next/image 대신 img를 쓴다.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt=""
                draggable={false}
                style={{
                  width: image.width * scale,
                  height: image.height * scale,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
                className="pointer-events-none absolute top-0 left-0 max-w-none"
              />
            )}
            {/* 원 바깥을 어둡게 덮어 프로필 사진이 될 부분만 드러낸다. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-2 ring-white/80"
            />
          </div>
        )}

        <label className="flex w-full max-w-[280px] items-center gap-3 typography-label-x-small text-on-surface-variant">
          확대
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            disabled={!image || failed}
            onChange={(event) => changeZoom(Number(event.target.value))}
            className="flex-1 accent-primary"
          />
        </label>
      </div>
    </Modal>
  );
}
