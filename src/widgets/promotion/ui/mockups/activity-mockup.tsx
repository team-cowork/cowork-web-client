'use client';

import { useEffect, useRef, useState } from 'react';

import { motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';
import {
  LAYOUT_SPRING,
  MockAvatar,
  MockChip,
  MockupFrame,
  POP_IN,
} from '@/widgets/promotion/ui/mockups/mockup-kit';

type FeedType = 'task' | 'code' | 'meeting';
type Filter = 'all' | FeedType;

const MAX_ITEMS = 6;
const FEED_INTERVAL = 4000;

const TYPE_LABELS: Record<FeedType, string> = {
  task: '태스크',
  code: '코드',
  meeting: '회의',
};

const TYPE_STYLES: Record<FeedType, { color: string; icon: string }> = {
  task: {
    color: 'bg-[#10b981]',
    icon: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
  },
  code: {
    color: 'bg-[#6366f1]',
    icon: 'M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  },
  meeting: {
    color: 'bg-[#f43f5e]',
    icon: 'M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z',
  },
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'task', label: '태스크' },
  { id: 'code', label: '코드' },
  { id: 'meeting', label: '회의' },
];

const EVENTS: { type: FeedType; name: string; avatar: number; text: string }[] =
  [
    {
      type: 'code',
      name: 'Olivia',
      avatar: 47,
      text: '님이 커밋 3개를 푸시했어요',
    },
    {
      type: 'task',
      name: 'Emma',
      avatar: 5,
      text: "님이 'JWT 토큰 갱신'을 맡았어요",
    },
    {
      type: 'meeting',
      name: 'Liam',
      avatar: 33,
      text: '님이 회의록을 공유했어요',
    },
    {
      type: 'code',
      name: 'John',
      avatar: 12,
      text: '님이 PR #43 리뷰를 요청했어요',
    },
    {
      type: 'task',
      name: 'Olivia',
      avatar: 47,
      text: "님이 '헬스 체크'를 완료했어요",
    },
    {
      type: 'meeting',
      name: 'Emma',
      avatar: 5,
      text: '님이 스프린트 회고를 예약했어요',
    },
  ];

interface FeedItem {
  id: number;
  type: FeedType;
  name: string;
  avatar: number;
  text: string;
  time: string;
  read: boolean;
  isNew: boolean;
}

const INITIAL_ITEMS: FeedItem[] = [
  {
    id: 1,
    type: 'meeting',
    name: 'John',
    avatar: 12,
    text: '님이 회의를 시작했어요',
    time: '방금',
  },
  {
    id: 2,
    type: 'task',
    name: 'Liam',
    avatar: 33,
    text: "님이 '로그인 API 구현'을 완료했어요",
    time: '2분 전',
  },
  {
    id: 3,
    type: 'code',
    name: 'Emma',
    avatar: 5,
    text: '님의 PR #42가 머지됐어요',
    time: '5분 전',
  },
].map((item) => ({
  ...item,
  type: item.type as FeedType,
  read: false,
  isNew: false,
}));

export function ActivityMockup() {
  const isHovered = useRef(false);
  const turn = useRef(0);
  const nextId = useRef(INITIAL_ITEMS.length + 1);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    // 보는 중에는 목록이 움직이지 않도록 마우스가 올라가 있으면 새 활동을 미룬다.
    const timer = setInterval(() => {
      if (isHovered.current) return;
      const event = EVENTS[turn.current++ % EVENTS.length];
      setItems((current) =>
        [
          {
            ...event,
            id: nextId.current++,
            time: '방금',
            read: false,
            isNew: true,
          },
          ...current,
        ].slice(0, MAX_ITEMS),
      );
    }, FEED_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const unread = items.filter((item) => !item.read).length;
  const markRead = (id?: number) =>
    setItems((current) =>
      current.map((item) =>
        id === undefined || item.id === id ? { ...item, read: true } : item,
      ),
    );

  return (
    <MockupFrame>
      <div
        className="flex min-h-0 flex-1 flex-col"
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">활동</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#10b981]">
              <span className="mock-live-dot size-1.5 rounded-full bg-current" />{' '}
              실시간
            </span>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span className="rounded-full bg-(--accent) px-1.5 py-0.5 text-[9px] font-bold text-white">
                새 활동 {unread}
              </span>
            )}
            <button
              type="button"
              tabIndex={-1}
              onClick={() => markRead()}
              className="cursor-pointer text-[9px] font-semibold text-gray-400 transition-colors hover:text-gray-700"
            >
              모두 읽음
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 pt-2.5">
          {FILTERS.map(({ id, label }) => (
            <MockChip
              key={id}
              active={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </MockChip>
          ))}
        </div>

        <motion.div
          layoutScroll
          className="mock-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-2.5"
        >
          {items
            .filter((item) => filter === 'all' || item.type === filter)
            .map((item) => (
              <motion.div
                key={item.id}
                layout="position"
                transition={LAYOUT_SPRING}
                initial={item.isNew ? POP_IN.initial : false}
                animate={{ ...POP_IN.animate, opacity: item.read ? 0.5 : 1 }}
                onClick={() => markRead(item.id)}
                className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 p-2.5"
              >
                <span className="relative shrink-0">
                  <MockAvatar img={item.avatar} size={32} />
                  <span
                    className={cn(
                      'absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full shadow-[0_0_0_2px_white]',
                      TYPE_STYLES[item.type].color,
                    )}
                  >
                    <svg fill="white" width="8" height="8" viewBox="0 0 24 24">
                      <path d={TYPE_STYLES[item.type].icon} />
                    </svg>
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] leading-snug text-gray-700">
                    <b className="text-gray-900">{item.name}</b>
                    {item.text}
                  </p>
                  <span className="text-[9px] text-gray-400">
                    {TYPE_LABELS[item.type]} · {item.time}
                  </span>
                </div>
                <span
                  className={cn(
                    'size-1.5 shrink-0 rounded-full bg-(--accent)',
                    item.read && 'invisible',
                  )}
                />
              </motion.div>
            ))}
        </motion.div>
      </div>
    </MockupFrame>
  );
}
