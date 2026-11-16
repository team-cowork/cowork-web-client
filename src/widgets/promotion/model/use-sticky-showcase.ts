'use client';

import { useRef, useState } from 'react';

import { useMotionValueEvent, useScroll } from 'motion/react';

/** 프로모션 상단 헤더(h-16) 높이. 쇼케이스 화면이 이 아래에 고정된다. */
export const PROMOTION_HEADER_HEIGHT = 64;

export const padSceneNumber = (value: number) => String(value).padStart(2, '0');

/**
 * 섹션을 스크롤하는 동안 화면을 고정해 두고, 진행률에 따라 몇 번째 장면인지 알려 준다.
 * 원본: cowork-promotion의 sticky-showcase.js, core/dom.js
 */
export function useStickyShowcase(count: number) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 64px', 'end end'],
  });
  useMotionValueEvent(scrollYProgress, 'change', (progress) =>
    setActiveIndex(Math.min(count - 1, Math.floor(progress * count))),
  );

  const scrollToScene = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const viewportHeight = window.innerHeight - PROMOTION_HEADER_HEIGHT;
    const scrollable = Math.max(0, section.offsetHeight - viewportHeight);
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({
      top:
        sectionTop - PROMOTION_HEADER_HEIGHT + (index / count) * scrollable + 1,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return { sectionRef, activeIndex, scrollYProgress, scrollToScene };
}
