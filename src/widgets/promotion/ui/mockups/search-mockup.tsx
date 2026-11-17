'use client';

import { useState } from 'react';

import { motion } from 'motion/react';

import {
  MockChip,
  MockupFrame,
  useTimers,
} from '@/widgets/promotion/ui/mockups/mockup-kit';

type Query = '로그인' | '배포' | '회의록';

interface Result {
  kind: 'message' | 'file';
  author: string;
  channel: string;
  time: string;
  text: string;
  attachment: boolean;
}

const RESULTS: Record<Query, Result[]> = {
  로그인: [
    {
      kind: 'message',
      author: 'Emma',
      channel: '#general',
      time: '어제',
      text: '로그인 플로우 정리해서 공유드려요',
      attachment: true,
    },
    {
      kind: 'file',
      author: 'Liam',
      channel: '#backend',
      time: '5시간 전',
      text: '로그인-API-명세.pdf',
      attachment: true,
    },
    {
      kind: 'message',
      author: 'John',
      channel: '#frontend',
      time: '3시간 전',
      text: '로그인 버그 재현됨',
      attachment: false,
    },
  ],
  배포: [
    {
      kind: 'message',
      author: 'Olivia',
      channel: '#devops',
      time: '10분 전',
      text: '오늘 배포는 18시에 진행할게요',
      attachment: true,
    },
    {
      kind: 'file',
      author: 'Emma',
      channel: '#backend',
      time: '어제',
      text: '배포-체크리스트.md',
      attachment: true,
    },
    {
      kind: 'message',
      author: 'Liam',
      channel: '#general',
      time: '2일 전',
      text: '배포 끝나면 채널에 알려 주세요',
      attachment: false,
    },
  ],
  회의록: [
    {
      kind: 'file',
      author: 'John',
      channel: '#general',
      time: '어제',
      text: '스프린트-회의록.pdf',
      attachment: true,
    },
    {
      kind: 'message',
      author: 'Emma',
      channel: '#frontend',
      time: '3시간 전',
      text: '회의록 보고 디자인 반영했어요',
      attachment: true,
    },
    {
      kind: 'message',
      author: 'Liam',
      channel: '#backend',
      time: '1일 전',
      text: '회의록에 API 일정 추가했어요',
      attachment: false,
    },
  ],
};

const QUERIES: Query[] = ['로그인', '배포', '회의록'];

const FILTERS: {
  id: string;
  label: string;
  match: (result: Result) => boolean;
}[] = [
  { id: 'all', label: '전체 채널', match: () => true },
  {
    id: 'author',
    label: '작성자',
    match: (result) => result.author === 'Emma',
  },
  { id: 'file', label: '파일', match: (result) => result.kind === 'file' },
  {
    id: 'attachment',
    label: '첨부 포함',
    match: (result) => result.attachment,
  },
];

function Highlighted({ text, keyword }: { text: string; keyword: string }) {
  const index = text.indexOf(keyword);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-xs bg-(--accent)/18 px-px text-inherit">
        {keyword}
      </mark>
      {text.slice(index + keyword.length)}
    </>
  );
}

export function SearchMockup() {
  const later = useTimers();
  const [typed, setTyped] = useState<string>('로그인');
  const [query, setQuery] = useState<Query>('로그인');
  const [isSearching, setIsSearching] = useState(false);
  const [filterId, setFilterId] = useState('all');

  const filter =
    FILTERS.find((candidate) => candidate.id === filterId) ?? FILTERS[0];
  const visible = RESULTS[query].filter(filter.match);

  // 지우고 다시 입력하는 타이핑 연출 뒤에 결과를 바꾼다.
  const search = (next: Query) => {
    if (isSearching || typed === next) return;
    setIsSearching(true);

    const previous = [...typed];
    previous.forEach((_, index) =>
      later((index + 1) * 40, () =>
        setTyped(previous.slice(0, previous.length - index - 1).join('')),
      ),
    );
    const typingStart = previous.length * 40 + 120;
    const characters = [...next];
    characters.forEach((_, index) =>
      later(typingStart + (index + 1) * 80, () =>
        setTyped(characters.slice(0, index + 1).join('')),
      ),
    );
    later(typingStart + characters.length * 80 + 150, () => {
      setQuery(next);
      setIsSearching(false);
    });
  };

  return (
    <MockupFrame>
      <div className="border-b border-gray-100 p-3">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <svg
            className="stroke-(--accent)"
            fill="none"
            width="14"
            height="14"
            strokeLinecap="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" x2="16.5" y1="21" y2="16.5" />
          </svg>
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-gray-700">
            {typed}
            <span className="mock-caret">|</span>
          </span>
          <span className="shrink-0 text-[9px] font-semibold text-gray-400">
            결과 {visible.length}개
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {FILTERS.map(({ id, label }) => (
            <MockChip
              key={id}
              active={filterId === id}
              onClick={() => setFilterId(id)}
            >
              {label}
            </MockChip>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[8px] font-semibold text-gray-400">
            최근 검색
          </span>
          {QUERIES.map((candidate) => (
            <button
              key={candidate}
              type="button"
              tabIndex={-1}
              onClick={() => search(candidate)}
              className="cursor-pointer text-[9px] font-semibold text-gray-500 underline decoration-gray-200 underline-offset-2 transition-colors hover:text-(--accent)"
            >
              {candidate}
            </button>
          ))}
        </div>
      </div>

      <div className="mock-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
        {visible.map((result, index) => (
          <motion.div
            key={`${query}-${result.text}`}
            initial={{ opacity: 0, filter: 'blur(4px)', y: 4 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
            className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-gray-50"
          >
            <span className="shrink-0 rounded bg-(--accent)/10 px-1.5 py-0.5 text-[8px] font-bold text-(--accent)">
              {result.kind === 'file' ? '파일' : '메시지'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold text-gray-800">
                <Highlighted text={result.text} keyword={query} />
              </p>
              <span className="text-[9px] text-gray-400">
                {result.author} · {result.channel} · {result.time}
                {result.kind === 'message' && result.attachment && ' · 첨부 1'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </MockupFrame>
  );
}
