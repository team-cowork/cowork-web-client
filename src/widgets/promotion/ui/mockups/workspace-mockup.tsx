'use client';

import { useRef, useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import {
  LAYOUT_SPRING,
  MockAvatar,
  MockupFrame,
  POP_IN,
  useTimers,
} from '@/widgets/promotion/ui/mockups/mockup-kit';

const MAX_MESSAGES = 3;
const TYPING_START_DELAY = 300;
const REPLY_DELAY = 1700;
const DRAFT_READY_DELAY = 1950;
const MY_AVATAR = 68;

const DRAFTS = [
  '좋아요, 저는 리뷰 맡을게요',
  '회의록은 채널에 공유해 둘게요',
  '오늘 안에 PR 올리겠습니다',
];
const REPLIES = [
  { name: 'Emma', avatar: 5, text: '좋아요! 같이 봐요' },
  { name: 'Liam', avatar: 33, text: '확인했습니다 👍' },
  { name: 'John', avatar: 12, text: '고마워요, 진행해 주세요' },
];
const PRESENCE = [12, 5, 33];

interface Message {
  id: number;
  name: string;
  avatar: number;
  text: string;
  time: string;
  reacted: boolean;
  isNew: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    name: 'John',
    avatar: 12,
    text: '이번 스프린트 목표 정리해서 올렸어요',
    time: '오전 10:02',
  },
  {
    id: 2,
    name: 'Emma',
    avatar: 5,
    text: '확인했어요, 로그인 API부터 맡을게요',
    time: '오전 10:04',
  },
  {
    id: 3,
    name: 'Liam',
    avatar: 33,
    text: '저는 칸반 보드 쪽 이어서 할게요',
    time: '오전 10:05',
  },
].map((message) => ({ ...message, reacted: false, isNew: false }));

export function WorkspaceMockup() {
  const later = useTimers();
  const nextId = useRef(INITIAL_MESSAGES.length + 1);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState(DRAFTS[0]);
  const [typingName, setTypingName] = useState<string>();
  const [turn, setTurn] = useState(0);
  const [isReplying, setIsReplying] = useState(false);

  const append = (message: Omit<Message, 'id' | 'reacted' | 'isNew'>) =>
    setMessages((current) =>
      [
        ...current,
        { ...message, id: nextId.current++, reacted: false, isNew: true },
      ].slice(-MAX_MESSAGES),
    );

  const send = () => {
    if (isReplying) return;

    const reply = REPLIES[turn % REPLIES.length];
    const nextDraft = [...DRAFTS[(turn + 1) % DRAFTS.length]];
    append({ name: '나', avatar: MY_AVATAR, text: draft, time: '방금' });
    setTurn(turn + 1);
    setIsReplying(true);

    setDraft('');
    const interval =
      (DRAFT_READY_DELAY - TYPING_START_DELAY) / nextDraft.length;
    nextDraft.forEach((_, index) =>
      later(TYPING_START_DELAY + (index + 1) * interval, () =>
        setDraft(nextDraft.slice(0, index + 1).join('')),
      ),
    );

    later(500, () => setTypingName(reply.name));
    later(REPLY_DELAY, () => {
      setTypingName(undefined);
      append({ ...reply, time: '방금' });
    });
    later(DRAFT_READY_DELAY, () => setIsReplying(false));
  };

  const toggleReaction = (id: number) =>
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, reacted: !message.reacted } : message,
      ),
    );

  return (
    <MockupFrame>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-(--accent)" />
          <span className="text-xs font-bold">백엔드 워크스페이스</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-2">
            {PRESENCE.map((img, index) => (
              <span
                key={img}
                className="relative"
                style={{ zIndex: PRESENCE.length - index }}
              >
                <MockAvatar img={img} size={24} className="ring-2 ring-white" />
                <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </span>
            ))}
          </div>
          <span className="text-[10px] font-semibold whitespace-nowrap text-gray-400">
            3명 접속 중
          </span>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-4 pt-4 pb-2">
        <div className="text-[11px] font-bold text-gray-700">
          # 스프린트-계획
        </div>
        <div className="mt-2 flex flex-1 flex-col gap-2.5 overflow-hidden">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout="position"
              transition={LAYOUT_SPRING}
              initial={message.isNew ? POP_IN.initial : false}
              animate={POP_IN.animate}
              onClick={() => toggleReaction(message.id)}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <MockAvatar img={message.avatar} size={24} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] leading-snug text-gray-700">
                  <b className="text-gray-900">{message.name}</b> {message.text}
                </p>
                <span className="text-[9px] text-gray-400">{message.time}</span>
                <AnimatePresence>
                  {message.reacted && (
                    <motion.span
                      {...POP_IN}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="ml-1.5 inline-block rounded-full bg-(--accent)/8 px-1.5 text-[9px] font-semibold text-(--accent)"
                    >
                      👍 1
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
        {typingName && (
          <span className="absolute bottom-1 left-4 flex items-center gap-1.5 text-[9px] text-gray-400">
            <span className="inline-flex items-center gap-0.5">
              {[0, 0.15, 0.3].map((delay) => (
                <span
                  key={delay}
                  className="mock-typing-dot"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </span>
            {typingName} 님이 입력 중
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2">
        <span className="min-w-0 flex-1 truncate rounded-full bg-gray-100 px-3 py-1 text-[10px] text-gray-700">
          {draft}
          <span className="mock-caret">|</span>
        </span>
        <button
          type="button"
          tabIndex={-1}
          onClick={send}
          aria-label="메시지 보내기"
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-(--accent)"
        >
          <svg fill="white" width="11" height="11" viewBox="0 0 24 24">
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </MockupFrame>
  );
}
