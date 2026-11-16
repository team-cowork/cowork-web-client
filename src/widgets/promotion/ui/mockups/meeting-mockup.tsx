'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';
import {
  LAYOUT_SPRING,
  MockAvatar,
  MockupFrame,
} from '@/widgets/promotion/ui/mockups/mockup-kit';

const MAX_TIMER_SECONDS = 99 * 60 + 59;
const INITIAL_SECONDS = 12 * 60 + 4;

const MIC_ON =
  'M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11z';
const MIC_OFF =
  'M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3 3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z';
const SPEAKER_OFF =
  'M16.5 12c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12h-2zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4 9.91 6.09 12 8.18V4z';
const CAMERA_ON =
  'M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z';
const CAMERA_OFF =
  'M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2 2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z';
const HANG_UP =
  'M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85a.99.99 0 0 1-1.41-.03L.29 13.08a.99.99 0 0 1 .03-1.42C3.34 8.78 7.46 7 12 7s8.66 1.78 11.69 4.66c.39.39.4 1.02.03 1.42l-2.48 2.46c-.37.39-1 .4-1.41.03a11.6 11.6 0 0 0-2.66-1.85.99.99 0 0 1-.56-.9v-3.1A15.6 15.6 0 0 0 12 9z';

const OTHERS = [
  { name: 'Emma', avatar: 5, delay: 0.2 },
  { name: 'Liam', avatar: 33, delay: 0.4 },
  { name: 'Olivia', avatar: 47, delay: 0.6 },
];

const formatTimer = (seconds: number) =>
  [Math.floor(seconds / 60), seconds % 60]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');

function Glyph({
  path,
  size,
  fill = 'white',
}: {
  path: string;
  size: number;
  fill?: string;
}) {
  return (
    <svg fill={fill} width={size} height={size} viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  );
}

function Tile({
  name,
  avatar,
  delay,
  badge,
  className,
  children,
}: {
  name: string;
  avatar: number;
  delay: number;
  badge: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'mock-meet-tile relative flex size-full items-center justify-center overflow-hidden rounded-lg bg-gray-800',
        className,
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <MockAvatar img={avatar} size={36} className="ring-2 ring-white/10" />
      {children}
      <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[8px] font-semibold">
        {name}
      </span>
      {badge}
    </div>
  );
}

const BADGE =
  'absolute right-1 bottom-1 flex size-4 items-center justify-center rounded-full';
const CONTROL = 'flex size-7 items-center justify-center rounded-full';

export function MeetingMockup() {
  const [seconds, setSeconds] = useState(INITIAL_SECONDS);
  const [isJoined, setIsJoined] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    const timer = setInterval(
      () => setSeconds((value) => (value >= MAX_TIMER_SECONDS ? 0 : value + 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <MockupFrame className="bg-gray-900 text-white">
      <div className="flex items-center justify-between bg-black/30 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
          <span className="text-[10px] font-semibold">
            회의 중 ·{' '}
            <span className="tabular-nums">{formatTimer(seconds)}</span>
          </span>
        </div>
        <span className="text-[10px] text-white/50">
          {isJoined ? 4 : 3}명 참여
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5 p-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {isJoined && (
            <motion.div
              key="self"
              layout
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                scale: 0.3,
                opacity: 0,
                transition: { duration: 0.34, ease: 'easeIn' },
              }}
              transition={{ duration: 0.46, ease: 'easeOut' }}
            >
              <Tile
                name="나"
                avatar={12}
                delay={0}
                className={cn(
                  'transition-shadow duration-300',
                  isCameraOn && 'shadow-[inset_0_0_0_2px_var(--accent)]',
                )}
                badge={
                  <span
                    className={cn(
                      BADGE,
                      isMicOn ? 'bg-(--accent)' : 'bg-white/15',
                    )}
                  >
                    <Glyph path={isMicOn ? MIC_ON : MIC_OFF} size={9} />
                  </span>
                }
              >
                {isCameraOn && (
                  <>
                    <motion.img
                      src="https://picsum.photos/id/1/320/240"
                      alt=""
                      width={320}
                      height={240}
                      draggable={false}
                      initial={{ opacity: 0, filter: 'blur(6px)', scale: 1.12 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <motion.span
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="pointer-events-none absolute inset-0 bg-white"
                    />
                  </>
                )}
              </Tile>
            </motion.div>
          )}
          {OTHERS.map((person, index) => (
            <motion.div
              key={person.name}
              layout
              transition={LAYOUT_SPRING}
              className={cn(
                !isJoined && index === OTHERS.length - 1 && 'col-span-2',
              )}
            >
              <Tile
                {...person}
                badge={
                  <span className={cn(BADGE, 'bg-white/15')}>
                    <Glyph path={SPEAKER_OFF} size={9} />
                  </span>
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center bg-black/30 py-2">
        {isJoined ? (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              tabIndex={-1}
              aria-label="마이크"
              onClick={() => setIsMicOn(!isMicOn)}
              className={cn(
                CONTROL,
                'cursor-pointer',
                isMicOn ? 'bg-white/15' : 'bg-white',
              )}
            >
              <Glyph
                path={isMicOn ? MIC_ON : MIC_OFF}
                size={13}
                fill={isMicOn ? 'white' : '#111827'}
              />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="카메라"
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={cn(
                CONTROL,
                'cursor-pointer',
                isCameraOn ? 'bg-white/15' : 'bg-white',
              )}
            >
              <Glyph
                path={isCameraOn ? CAMERA_ON : CAMERA_OFF}
                size={13}
                fill={isCameraOn ? 'white' : '#111827'}
              />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="나가기"
              onClick={() => setIsJoined(false)}
              className={cn(CONTROL, 'cursor-pointer bg-red-500')}
            >
              <Glyph path={HANG_UP} size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsJoined(true)}
            className="h-7 cursor-pointer rounded-full bg-emerald-500 px-6 text-[10px] font-bold text-white"
          >
            참여하기
          </button>
        )}
      </div>
    </MockupFrame>
  );
}
