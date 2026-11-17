'use client';

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useRef,
  useState,
} from 'react';

import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import Link from 'next/link';

import { cn } from '@/shared/lib/cn';
import { HOME_PATH } from '@/shared/model/paths';
import { type AchievementSummary } from '@/widgets/promotion/model/achievements';
import {
  STICKY_SCROLL_OFFSET,
  padSceneNumber,
  scrollToStickyScene,
} from '@/widgets/promotion/model/use-sticky-showcase';

import './achievements.css';

const SCENE_LABELS = [
  '코드 변경 성과',
  'Pull Request 성과',
  '컨트리뷰터 성과',
  'AI 활용 성과',
  '커밋 성과',
];
const AI_SCENE = 3;
const AI_SYMBOLS = ['{}', '=>', '()', '[]', '+', '&&', ';', '</>'];
const COMMIT_NODES = [
  { cx: 80, cy: 32, line: 'M106 32h72' },
  { cx: 80, cy: 96, line: 'M106 96h42' },
  { cx: 220, cy: 160, line: 'M246 160h86', kind: 'branch' },
  { cx: 80, cy: 192, line: 'M106 192h46' },
  { cx: 368, cy: 232, line: 'M394 232h52', kind: 'second' },
  { cx: 220, cy: 256, line: 'M246 256h46', kind: 'branch' },
  { cx: 80, cy: 280, line: 'M106 280h74' },
  { cx: 368, cy: 280, line: 'M394 280h32', kind: 'second' },
  { cx: 80, cy: 344, line: 'M106 344h80' },
];

const formatNumber = (value: number) => value.toLocaleString('ko-KR');
const cssVars = (vars: Record<string, number>) => vars as CSSProperties;

function Scene({
  index,
  activeIndex,
  isEnhanced,
  variant,
  labelledBy,
  layout,
  children,
}: {
  index: number;
  activeIndex: number;
  isEnhanced: boolean;
  variant: string;
  labelledBy: string;
  layout: string;
  children: ReactNode;
}) {
  // 연출 모드에서는 지금 장면만 보이므로 나머지는 포커스와 보조 기술에서 뺀다.
  const isHidden = isEnhanced && index !== activeIndex;
  return (
    <section
      aria-labelledby={labelledBy}
      aria-hidden={isHidden || undefined}
      inert={isHidden}
      className={cn(
        'achievement-scene',
        `achievement-scene--${variant}`,
        index === activeIndex && 'is-active',
      )}
    >
      <div className={cn('achievement-scene__inner ui-container', layout)}>
        {children}
      </div>
    </section>
  );
}

/**
 * 스크롤하면 성과 장면 5개가 차례로 바뀌고, 장면 안의 그림도 스크롤에 맞춰 움직인다.
 * 원본: cowork-promotion의 achievement-story.js와 sections/achievements/*.html
 */
export function AchievementStory({ data }: { data: AchievementSummary }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isEnhanced = !reduceMotion;
  const [activeIndex, setActiveIndex] = useState(0);
  const count = SCENE_LABELS.length;

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: STICKY_SCROLL_OFFSET,
  });
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const progress = isEnhanced ? value : 0;
    const index = Math.min(count - 1, Math.floor(progress * count));
    const sceneProgress = Math.min(1, progress * count - index);
    // 장면 안 그림은 리렌더 없이 CSS 변수로 움직인다.
    const style = rootRef.current?.style;
    style?.setProperty('--story-progress', String(progress));
    style?.setProperty('--scene-progress', String(sceneProgress));
    style?.setProperty(
      '--ai-reveal',
      String(Math.min(100, sceneProgress * 180)),
    );
    setActiveIndex(index);
  });

  const goTo = (index: number) => {
    if (!rootRef.current) return;
    const target = Math.max(0, Math.min(count - 1, index));
    scrollToStickyScene(rootRef.current, target, count);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (
      target !== event.currentTarget &&
      !target.closest('[data-achievement-dot]')
    ) {
      return;
    }
    const offset = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!offset) return;
    event.preventDefault();
    goTo(activeIndex + offset);
  };

  const sceneProps = { activeIndex, isEnhanced };

  return (
    <div className="achievements">
      <div
        ref={rootRef}
        tabIndex={0}
        aria-label="개발 성과 이야기"
        onKeyDown={handleKeyDown}
        data-active-scene={activeIndex}
        className={cn('achievement-story', isEnhanced && 'is-enhanced')}
        style={cssVars({
          '--scene-count': count,
          '--ai-reveal': isEnhanced ? 0 : 100,
        })}
      >
        <div className="achievement-stage">
          <div className="achievement-toolbar ui-container">
            <span>개발 성과</span>
          </div>

          <Scene
            {...sceneProps}
            index={0}
            variant="code"
            labelledBy="achievement-code-title"
            layout="achievement-code-layout"
          >
            <div className="achievement-copy">
              <h1 id="achievement-code-title">
                함께 만든 변화,
                <br />
                코드에 남다.
              </h1>
              <div className="achievement-code-summary">
                <p className="achievement-code-count">
                  {formatNumber(data.changedLines)}
                  <span>라인</span>
                </p>
                <div className="achievement-diff-stats">
                  <span className="achievement-diff-add">
                    +{formatNumber(data.additions)}
                    <span className="sr-only"> 추가</span>
                  </span>
                  <span className="achievement-diff-remove">
                    −{formatNumber(data.deletions)}
                    <span className="sr-only"> 삭제</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="achievement-code-art" aria-hidden>
              <span className="achievement-code-art__symbol achievement-code-art__symbol--add">
                +
              </span>
              <span className="achievement-code-art__symbol achievement-code-art__symbol--remove">
                −
              </span>
              <div className="achievement-code-art__file">
                <div className="achievement-code-art__header">
                  collaboration.ts
                </div>
                <div className="achievement-code-line achievement-code-line--remove">
                  <span>−</span>
                  <code>work.alone();</code>
                </div>
                <div className="achievement-code-line achievement-code-line--add">
                  <span>+</span>
                  <code>work.together();</code>
                </div>
                <div className="achievement-code-line achievement-code-line--add">
                  <span>+</span>
                  <code>progress.share();</code>
                </div>
              </div>
            </div>
          </Scene>

          <Scene
            {...sceneProps}
            index={1}
            variant="prs"
            labelledBy="achievement-pr-title"
            layout="achievement-pr-layout"
          >
            <div className="achievement-copy">
              <h2 id="achievement-pr-title">
                가장 뜨거웠던
                <br />한 주.
              </h2>
              <p className="achievement-metric-label">Pull Request</p>
              <p className="achievement-number">
                {formatNumber(data.peakPullRequests)}
                <span>개</span>
              </p>
            </div>
            <div className="achievement-pr-visual">
              <svg
                className="achievement-merge-mark"
                aria-hidden
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="6" cy="5" r="3" />
                <circle cx="6" cy="19" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M6 8v8M9 5h1a8 8 0 0 1 8 8v3" />
              </svg>
              <div className="achievement-pr-activity" aria-hidden>
                {Array.from({ length: data.peakPullRequests }, (_, index) => (
                  <span
                    key={index}
                    className="achievement-pr-token"
                    style={cssVars({ '--pr-index': index })}
                  />
                ))}
              </div>
            </div>
          </Scene>

          <Scene
            {...sceneProps}
            index={2}
            variant="people"
            labelledBy="achievement-people-title"
            layout="achievement-people-layout"
          >
            <div className="achievement-copy">
              <h2 id="achievement-people-title">
                혼자서는
                <br />
                만들 수 없는 변화.
              </h2>
              <p className="achievement-metric-label">함께한 컨트리뷰터</p>
              <p className="achievement-number">
                {formatNumber(data.contributorLogins.length)}
                <span>명</span>
              </p>
            </div>
            <div className="achievement-people" aria-label="cowork 컨트리뷰터">
              {data.contributorLogins.map((login) => (
                <a
                  key={login}
                  className="achievement-person"
                  href={`https://github.com/${login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- GitHub 프로필 사진 리다이렉트 주소라 이미지 최적화를 거치지 않는다. */}
                  <img
                    src={`https://github.com/${login}.png?size=96`}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{login}</span>
                </a>
              ))}
            </div>
          </Scene>

          <Scene
            {...sceneProps}
            index={AI_SCENE}
            variant="ai"
            labelledBy="achievement-ai-title"
            layout="achievement-ai-layout"
          >
            <div className="achievement-copy">
              <h2 id="achievement-ai-title">
                AI와 함께
                <br />
                만드는 코드.
              </h2>
              <p className="achievement-metric-label">LLM 생성 코드</p>
              <p className="achievement-ai-percentage">
                98<span>%</span>
              </p>
            </div>
            <div className="achievement-ai-mosaic" aria-hidden>
              {Array.from({ length: 100 }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    'achievement-ai-cell',
                    index >= 98 && 'achievement-ai-cell--human',
                  )}
                  style={cssVars({ '--cell-index': index })}
                >
                  {AI_SYMBOLS[index % AI_SYMBOLS.length]}
                </span>
              ))}
            </div>
          </Scene>

          <Scene
            {...sceneProps}
            index={4}
            variant="commits"
            labelledBy="achievement-commit-title"
            layout="achievement-commit-layout"
          >
            <div className="achievement-copy">
              <h2 id="achievement-commit-title">
                한 번의 커밋,
                <br />한 걸음의 전진.
              </h2>
              <p className="achievement-metric-label">함께 쌓은 커밋</p>
              <p className="achievement-number">
                {formatNumber(data.commits)}
                <span>커밋</span>
              </p>
              <Link
                href={HOME_PATH}
                className="achievement-home-link inline-flex h-11 items-center justify-center rounded-xl bg-primary px-[18px] typography-label-medium text-on-primary transition-opacity hover:opacity-90"
              >
                cowork 둘러보기
              </Link>
            </div>
            <div className="achievement-commit-visual" aria-hidden>
              <svg
                className="achievement-commit-graph"
                fill="none"
                viewBox="0 0 480 400"
              >
                <g className="achievement-commit-paths">
                  <path
                    className="achievement-commit-path achievement-commit-path--main"
                    d="M80 28V372"
                    pathLength={1}
                  />
                  <path
                    className="achievement-commit-path achievement-commit-path--branch"
                    d="M80 72C80 120 220 110 220 160V256C220 304 80 296 80 344"
                    pathLength={1}
                  />
                  <path
                    className="achievement-commit-path achievement-commit-path--second"
                    d="M220 176C220 208 368 188 368 232V280C368 324 220 308 220 340"
                    pathLength={1}
                  />
                </g>
                {COMMIT_NODES.map((node) => (
                  <g
                    key={`${node.cx}-${node.cy}`}
                    className={cn(
                      'achievement-commit-node',
                      node.kind && `achievement-commit-node--${node.kind}`,
                    )}
                  >
                    <circle cx={node.cx} cy={node.cy} r="9" />
                    <path d={node.line} />
                  </g>
                ))}
              </svg>
            </div>
          </Scene>

          <div className="achievement-controls ui-container">
            <div className="achievement-controls__position">
              <span>
                {padSceneNumber(activeIndex + 1)} / {padSceneNumber(count)}
              </span>
              <div className="achievement-progress" aria-hidden>
                <span />
              </div>
            </div>
            <div
              className="achievement-dots"
              role="group"
              aria-label="성과 선택"
            >
              {SCENE_LABELS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  aria-current={index === activeIndex ? 'step' : 'false'}
                  data-achievement-dot={index}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
            <span className="achievement-scroll-hint" aria-hidden>
              스크롤해서 더 보기 <span>↓</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
