'use client';

import { useRef, useState } from 'react';

import { useMotionValueEvent, useScroll } from 'motion/react';

/** 프로모션 상단 헤더(h-16) 높이. 쇼케이스 화면이 이 아래에 고정된다. */
export const PROMOTION_HEADER_HEIGHT = 64;

export const STICKY_SCROLL_OFFSET: NonNullable<
  NonNullable<Parameters<typeof useScroll>[0]>['offset']
> = [`start ${PROMOTION_HEADER_HEIGHT}px`, 'end end'];

export const padSceneNumber = (value: number) => String(value).padStart(2, '0');

export function scrollToStickyScene(
  element: HTMLElement,
  index: number,
  count: number,
) {
  const viewportHeight = window.innerHeight - PROMOTION_HEADER_HEIGHT;
  const scrollable = Math.max(0, element.offsetHeight - viewportHeight);
  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  window.scrollTo({
    top:
      elementTop - PROMOTION_HEADER_HEIGHT + (index / count) * scrollable + 1,
    behavior: reduceMotion ? 'auto' : 'smooth',
  });
}

/**
 * 섹션을 스크롤하는 동안 화면을 고정해 두고, 진행률에 따라 몇 번째 장면인지 알려 준다.
 * 원본: cowork-promotion의 sticky-showcase.js, core/dom.js
 */
export function useStickyShowcase(count: number) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: STICKY_SCROLL_OFFSET,
  });
  useMotionValueEvent(scrollYProgress, 'change', (progress) =>
    setActiveIndex(Math.min(count - 1, Math.floor(progress * count))),
  );

  const scrollToScene = (index: number) => {
    if (sectionRef.current) {
      scrollToStickyScene(sectionRef.current, index, count);
    }
  };

  return { sectionRef, activeIndex, scrollYProgress, scrollToScene };
}
