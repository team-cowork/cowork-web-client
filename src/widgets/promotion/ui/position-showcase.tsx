'use client';

import { type CSSProperties } from 'react';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';

import {
  PROMOTION_MEMBERS,
  PROMOTION_POSITIONS,
} from '@/widgets/promotion/model/promotion-content';
import {
  padSceneNumber,
  useStickyShowcase,
} from '@/widgets/promotion/model/use-sticky-showcase';
import { Avatar } from '@/shared/ui/avatar';

/**
 * 포지션마다 하는 일, 쓰는 기술, 맡은 팀원을 스크롤에 따라 한 장면씩 보여 준다.
 * 원본: cowork-promotion의 position-showcase.js
 */
export function PositionShowcase() {
  const count = PROMOTION_POSITIONS.length;
  const { sectionRef, activeIndex, scrollToScene } = useStickyShowcase(count);
  const position = PROMOTION_POSITIONS[activeIndex];
  const members = PROMOTION_MEMBERS.filter((member) =>
    member.roles.includes(position.name),
  );

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-label="포지션 소개"
        className="relative"
        style={{ height: `calc(${count} * 50svh + 100svh)` }}
      >
        <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden bg-surface">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center overflow-hidden select-none"
          >
            <span
              className="pl-[4vw] text-[clamp(160px,28vw,380px)] leading-none font-black opacity-[0.04]"
              style={{ color: position.color }}
            >
              {padSceneNumber(activeIndex + 1)}
            </span>
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-3 px-6 py-4">
            <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
              Position
            </span>
            <span className="text-xs text-on-surface-variant tabular-nums">
              {padSceneNumber(activeIndex + 1)} / {padSceneNumber(count)}
            </span>
          </div>

          <div className="mock-scroll relative min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 28 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                }}
                exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
                style={{ '--accent': position.color } as CSSProperties}
                className="mx-auto grid min-h-full w-full max-w-6xl content-center items-center gap-8 px-6 py-4 lg:grid-cols-2 lg:gap-12"
              >
                <div>
                  <span className="mb-5 block size-2 rounded-full bg-(--accent)" />
                  <h2 className="mb-5 text-5xl leading-tight font-black tracking-tight text-(--accent) lg:text-6xl">
                    {position.name}
                  </h2>
                  <p className="mb-5 leading-relaxed break-keep text-on-surface-variant">
                    {position.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {position.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-full bg-(--accent)/8 px-2.5 py-1 text-xs leading-4 font-semibold text-(--accent)"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                </div>
                <ul className="flex flex-wrap content-start gap-3 pb-1">
                  {members.map((member) => (
                    <li key={member.github}>
                      <a
                        href={`https://github.com/${member.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 rounded-xl border border-(--accent)/19 bg-(--accent)/7 px-4 py-2.5"
                      >
                        <Avatar
                          src={`https://avatars.githubusercontent.com/${member.github}?s=64`}
                          name={member.name}
                          size={32}
                          shape="circle"
                        />
                        <div className="min-w-0">
                          <p className="text-sm leading-tight font-semibold">
                            {member.name}
                          </p>
                          <p className="text-xs leading-4 text-on-surface-variant">
                            {member.generation}기
                          </p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl shrink-0 items-center justify-end gap-3 px-6 py-4">
            <div
              role="group"
              aria-label="포지션 선택"
              className="flex items-center"
            >
              {PROMOTION_POSITIONS.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-label={`포지션 ${index + 1} / ${count}`}
                  aria-current={index === activeIndex ? 'step' : undefined}
                  onClick={() => scrollToScene(index)}
                  className="grid h-8 min-w-6 cursor-pointer place-items-center rounded-md px-1"
                >
                  <span
                    className="h-2 rounded-full bg-outline-variant transition-[width,background-color] duration-200"
                    style={
                      index === activeIndex
                        ? { width: 32, backgroundColor: position.color }
                        : { width: 8 }
                    }
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
