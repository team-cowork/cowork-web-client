'use client';

import { type PointerEvent, useRef, useState } from 'react';

import { LayoutGroup, motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';
import {
  LAYOUT_SPRING,
  MockAvatar,
  MockupFrame,
} from '@/widgets/promotion/ui/mockups/mockup-kit';

const DRAG_THRESHOLD = 4;

const COLUMNS = [
  { id: 'todo', label: '할 일' },
  { id: 'doing', label: '진행 중' },
  { id: 'done', label: '완료' },
] as const;

type ColumnId = (typeof COLUMNS)[number]['id'];

interface Card {
  id: string;
  title: string;
  tag: string;
  avatar: number;
  column: ColumnId;
  /** 카드가 좌우로 살짝 흔들리는 반복 애니메이션의 시작 지연(초) */
  delay: number;
}

const INITIAL_CARDS: Card[] = [
  {
    id: 'jwt',
    title: 'JWT 토큰 갱신',
    tag: 'Backend',
    avatar: 12,
    column: 'todo',
    delay: 0,
  },
  {
    id: 'notify',
    title: '알림 설정 화면',
    tag: 'Frontend',
    avatar: 5,
    column: 'todo',
    delay: 0.15,
  },
  {
    id: 'login',
    title: '로그인 API 구현',
    tag: 'Backend',
    avatar: 5,
    column: 'doing',
    delay: 0.15,
  },
  {
    id: 'db',
    title: 'DB 마이그레이션',
    tag: 'Backend',
    avatar: 33,
    column: 'done',
    delay: 0.3,
  },
  {
    id: 'health',
    title: '헬스 체크',
    tag: 'Infra',
    avatar: 47,
    column: 'done',
    delay: 0.45,
  },
];

interface Ghost {
  card: Card;
  left: number;
  top: number;
  width: number;
  dx: number;
  dy: number;
}

function moveCard(
  cards: Card[],
  id: string,
  column: ColumnId,
  beforeId?: string,
): Card[] {
  const card = cards.find((candidate) => candidate.id === id);
  if (!card) return cards;

  const rest = cards.filter((candidate) => candidate.id !== id);
  const moved = { ...card, column };
  const beforeIndex = beforeId
    ? rest.findIndex((candidate) => candidate.id === beforeId)
    : -1;
  if (beforeIndex >= 0) {
    return [...rest.slice(0, beforeIndex), moved, ...rest.slice(beforeIndex)];
  }

  const lastInColumn = rest.findLastIndex(
    (candidate) => candidate.column === column,
  );
  return lastInColumn >= 0
    ? [
        ...rest.slice(0, lastInColumn + 1),
        moved,
        ...rest.slice(lastInColumn + 1),
      ]
    : [...rest, moved];
}

function CardContent({ card }: { card: Card }) {
  const isDone = card.column === 'done';
  return (
    <>
      {!isDone && (
        <div className="mb-1.5 flex items-center gap-1">
          <span className="rounded bg-(--accent)/10 px-1 py-0.5 text-[7px] font-bold text-(--accent)">
            {card.tag}
          </span>
        </div>
      )}
      <p
        className={cn(
          'flex items-center gap-1 text-[9px] leading-tight font-semibold',
          isDone ? 'text-gray-400 line-through' : 'text-gray-700',
        )}
      >
        {isDone && (
          <svg
            className="shrink-0 fill-(--accent)"
            width="10"
            height="10"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
          </svg>
        )}
        <span className="min-w-0 truncate">{card.title}</span>
      </p>
      {!isDone && (
        <div className="mt-1.5 flex items-center">
          <MockAvatar img={card.avatar} size={16} />
        </div>
      )}
    </>
  );
}

export function BoardMockup() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    id: string;
    startX: number;
    startY: number;
    canDrag: boolean;
  }>(null);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [ghost, setGhost] = useState<Ghost>();

  const doneCount = cards.filter((card) => card.column === 'done').length;

  const handlePointerDown = (event: PointerEvent<HTMLElement>, card: Card) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      id: card.id,
      startX: event.clientX,
      startY: event.clientY,
      canDrag: event.pointerType !== 'touch',
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>, card: Card) => {
    const current = gesture.current;
    if (!current || current.id !== card.id) return;

    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (ghost) {
      setGhost({ ...ghost, dx, dy });
      return;
    }
    if (!current.canDrag || Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    const root = rootRef.current?.getBoundingClientRect();
    const rect = event.currentTarget.getBoundingClientRect();
    if (!root) return;
    setGhost({
      card,
      left: rect.left - root.left,
      top: rect.top - root.top,
      width: rect.width,
      dx,
      dy,
    });
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>, card: Card) => {
    if (gesture.current?.id !== card.id) return;
    gesture.current = null;

    if (!ghost) {
      if (event.type !== 'pointerup') return;
      // 드래그 없이 누르면 다음 단계로 넘긴다.
      const index = COLUMNS.findIndex((column) => column.id === card.column);
      const next = COLUMNS[(index + 1) % COLUMNS.length].id;
      setCards((current) => moveCard(current, card.id, next));
      return;
    }

    setGhost(undefined);
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-mock-column]');
    const column =
      target && rootRef.current?.contains(target)
        ? (target.dataset.mockColumn as ColumnId)
        : card.column;
    const before = [
      ...(rootRef.current?.querySelectorAll<HTMLElement>(
        `[data-mock-column="${column}"] [data-mock-card]`,
      ) ?? []),
    ].find((element) => {
      const rect = element.getBoundingClientRect();
      return (
        element.dataset.mockCard !== card.id &&
        rect.top + rect.height / 2 > event.clientY
      );
    });
    setCards((current) =>
      moveCard(current, card.id, column, before?.dataset.mockCard),
    );
  };

  return (
    <MockupFrame>
      <div
        ref={rootRef}
        className="relative flex min-h-0 flex-1 flex-col gap-2 p-3"
      >
        <div className="px-1">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-700">
              스프린트 진행률
            </span>
            <span className="text-[9px] font-semibold text-gray-400">
              {doneCount} / {cards.length} 완료
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-(--accent) transition-[width] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                width: `${Math.round((doneCount / cards.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        <LayoutGroup>
          <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-[minmax(0,1fr)] gap-2">
            {COLUMNS.map((column) => {
              const columnCards = cards.filter(
                (card) => card.column === column.id,
              );
              return (
                <div
                  key={column.id}
                  data-mock-column={column.id}
                  className="flex min-h-0 min-w-0 flex-col gap-2"
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-gray-500">
                      {column.label}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-300">
                      {columnCards.length}
                    </span>
                  </div>
                  <motion.div
                    layoutScroll
                    className="mock-scroll relative flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto pr-1"
                  >
                    {columnCards.map((card) => (
                      <motion.div
                        key={card.id}
                        layoutId={`board-card-${card.id}`}
                        transition={LAYOUT_SPRING}
                        data-mock-card={card.id}
                        onPointerDown={(event) =>
                          handlePointerDown(event, card)
                        }
                        onPointerMove={(event) =>
                          handlePointerMove(event, card)
                        }
                        onPointerUp={(event) => handlePointerEnd(event, card)}
                        onPointerCancel={(event) =>
                          handlePointerEnd(event, card)
                        }
                        className={cn(
                          'shrink-0 cursor-grab touch-none',
                          ghost?.card.id === card.id && 'opacity-35',
                        )}
                      >
                        <div
                          className="mock-kanban-card rounded-lg border border-gray-100 bg-gray-50 p-2"
                          style={{ animationDelay: `${card.delay}s` }}
                        >
                          <CardContent card={card} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </LayoutGroup>

        {ghost && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-gray-100 bg-gray-50 p-2 shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
            style={{
              left: ghost.left,
              top: ghost.top,
              width: ghost.width,
              transform: `translate(${ghost.dx}px, ${ghost.dy}px) rotate(2deg)`,
            }}
          >
            <CardContent card={ghost.card} />
          </div>
        )}
      </div>
    </MockupFrame>
  );
}
