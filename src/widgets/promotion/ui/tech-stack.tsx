'use client';

import { type MouseEvent, type PointerEvent, useRef, useState } from 'react';

import {
  PROMOTION_TECH_STACKS,
  type PromotionTechnology,
} from '@/widgets/promotion/model/promotion-tech-stacks';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

const isOnBackdrop = (event: PointerEvent | MouseEvent) => {
  const dialog = event.currentTarget as HTMLDialogElement;
  if (event.target !== dialog) return false;
  const { left, right, top, bottom } = dialog.getBoundingClientRect();
  return (
    event.clientX < left ||
    event.clientX > right ||
    event.clientY < top ||
    event.clientY > bottom
  );
};

/** 기술 배지를 누르면 설명 다이얼로그가 열린다. 원본: technology-dialog.js */
export function TechStack() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startedOnBackdrop = useRef(false);
  const [selected, setSelected] = useState<PromotionTechnology>();

  const open = (technology: PromotionTechnology) => {
    setSelected(technology);
    dialogRef.current?.showModal();
  };

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex flex-col gap-2">
          <h2 className="typography-display-medium">기술 스택</h2>
          <p className="typography-body-medium text-on-surface-variant">
            cowork을 만드는 기술들
          </p>
        </div>
        <div className="space-y-5">
          {PROMOTION_TECH_STACKS.map((category) => (
            <div
              key={category.name}
              className="flex flex-col items-start gap-6 sm:flex-row"
            >
              <span className="w-24 shrink-0 pt-2 text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                {category.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {category.items.map((technology) => (
                  <button
                    key={technology.name}
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => open(technology)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3.5 py-1.5 text-sm leading-5 font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                  >
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: technology.color }}
                    />
                    {technology.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="technology-name"
        aria-describedby="technology-released technology-description"
        onPointerDown={(event) =>
          (startedOnBackdrop.current = isOnBackdrop(event))
        }
        onClick={(event) => {
          // 바깥을 눌렀다 뗐을 때만 닫는다. 안에서 끌다가 바깥에서 떼면 닫지 않는다.
          if (startedOnBackdrop.current && isOnBackdrop(event)) {
            dialogRef.current?.close();
          }
          startedOnBackdrop.current = false;
        }}
        className="m-auto max-h-[calc(100dvh-3rem)] w-[min(30rem,calc(100%-3rem))] overscroll-contain rounded-3xl border border-outline-variant bg-surface [overflow-wrap:anywhere] text-on-surface shadow-2xl backdrop:bg-black/45"
      >
        {selected && (
          <div className="p-6">
            <header className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-on-surface-variant">기술 소개</p>
              <button
                type="button"
                autoFocus
                aria-label="기술 소개 닫기"
                onClick={() => dialogRef.current?.close()}
                className="grid size-11 cursor-pointer place-items-center rounded-full bg-surface-container text-on-surface-variant"
              >
                <CloseIcon size={20} />
              </button>
            </header>
            <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- 다이얼로그를 열 때마다 바뀌는 작은 로고라 최적화가 필요 없다. */}
              <img
                src={selected.logo}
                alt=""
                width={48}
                height={48}
                className="size-12 object-contain"
              />
              <div>
                <h3
                  id="technology-name"
                  className="mb-2 text-[clamp(1.5rem,7vw,1.875rem)] leading-tight font-bold tracking-tight"
                >
                  {selected.name}
                </h3>
                <p
                  id="technology-released"
                  className="text-sm text-on-surface-variant"
                >
                  {selected.released}
                </p>
              </div>
            </div>
            <p
              id="technology-description"
              className="my-6 leading-relaxed break-keep text-on-surface-variant"
            >
              {selected.description}
            </p>
            <a
              href={selected.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-2 text-sm text-on-surface-variant hover:text-on-surface"
            >
              공식 문서 보기 ↗
            </a>
          </div>
        )}
      </dialog>
    </section>
  );
}
