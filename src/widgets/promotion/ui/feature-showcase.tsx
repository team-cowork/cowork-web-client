'use client';

import { type CSSProperties, type ComponentType } from 'react';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';

import { PROMOTION_FEATURES } from '@/widgets/promotion/model/promotion-content';
import {
  padSceneNumber,
  useStickyShowcase,
} from '@/widgets/promotion/model/use-sticky-showcase';
import { ActivityMockup } from '@/widgets/promotion/ui/mockups/activity-mockup';
import { BoardMockup } from '@/widgets/promotion/ui/mockups/board-mockup';
import { GithubMockup } from '@/widgets/promotion/ui/mockups/github-mockup';
import { MeetingMockup } from '@/widgets/promotion/ui/mockups/meeting-mockup';
import { SearchMockup } from '@/widgets/promotion/ui/mockups/search-mockup';
import { WorkspaceMockup } from '@/widgets/promotion/ui/mockups/workspace-mockup';

import './mockups/mockup.css';

const MOCKUPS: Record<string, ComponentType> = {
  Workspace: WorkspaceMockup,
  Task: BoardMockup,
  Meeting: MeetingMockup,
  GitHub: GithubMockup,
  Tracking: ActivityMockup,
  Search: SearchMockup,
};

/**
 * 스크롤하는 동안 화면을 고정해 두고, 스크롤 진행률에 따라 기능 장면을 하나씩 바꿔 보여 준다.
 * 원본: cowork-promotion의 sticky-showcase.js, feature-showcase.js
 */
export function FeatureShowcase() {
  const count = PROMOTION_FEATURES.length;
  const { sectionRef, activeIndex, scrollYProgress, scrollToScene } =
    useStickyShowcase(count);
  const feature = PROMOTION_FEATURES[activeIndex];
  const Mockup = MOCKUPS[feature.label];

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-label="기능 소개"
        className="relative bg-gray-950"
        style={{ height: `calc(${count} * 70svh + 100svh)` }}
      >
        <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center overflow-hidden select-none"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 0.07, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="pl-[3vw] text-[clamp(220px,40vw,560px)] leading-none font-black"
                style={{ color: feature.color }}
              >
                {padSceneNumber(activeIndex + 1)}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-3 px-6 py-4">
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Features
            </span>
            <span className="text-xs text-gray-400 tabular-nums">
              {padSceneNumber(activeIndex + 1)} / {padSceneNumber(count)}
            </span>
          </div>

          <div className="mock-scroll relative min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                style={{ '--accent': feature.color } as CSSProperties}
                className="mx-auto grid min-h-full w-full max-w-6xl content-center items-center gap-8 px-6 py-4 lg:grid-cols-2 lg:gap-12"
              >
                <div>
                  <span className="inline-block rounded-full bg-(--accent)/13 px-3 py-1 text-xs font-semibold text-(--accent)">
                    {feature.label}
                  </span>
                  <h2 className="my-5 text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.15] font-black tracking-tight break-keep">
                    {feature.title}
                  </h2>
                  <p className="mb-5 leading-relaxed break-keep text-gray-400">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-(--accent)/13 px-2.5 py-1 text-xs font-semibold text-(--accent)"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="w-full max-w-xl justify-self-center">
                  <Mockup />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-3 px-6 py-4">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full origin-left transition-colors"
                style={{
                  scaleX: scrollYProgress,
                  backgroundColor: feature.color,
                }}
              />
            </div>
            <div
              role="group"
              aria-label="기능 선택"
              className="flex items-center"
            >
              {PROMOTION_FEATURES.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-label={`기능 ${index + 1} / ${count}`}
                  aria-current={index === activeIndex ? 'step' : undefined}
                  onClick={() => scrollToScene(index)}
                  className="grid h-8 min-w-6 cursor-pointer place-items-center rounded-md px-1"
                >
                  <span
                    className="h-2 rounded-full transition-[width,background-color] duration-200"
                    style={{
                      width: index === activeIndex ? 24 : 8,
                      backgroundColor:
                        index === activeIndex
                          ? feature.color
                          : 'rgb(255 255 255 / 0.2)',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
