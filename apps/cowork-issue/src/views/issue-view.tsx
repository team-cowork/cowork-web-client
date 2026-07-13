import { useState } from 'react';

import {
  Avatar,
  type AvatarTone,
  Badge,
  type BadgeProps,
  Button,
  Modal,
  SearchIcon,
  TextField,
} from '@cowork/ui';

type Card = {
  id: number;
  title: string;
  tags: { label: string; color: BadgeProps['color'] }[];
  due?: string;
  assignee: { name: string; tone: AvatarTone };
};

type Column = { name: string; dot: string; cards: Card[] };

// ponytail: 시연용 시드 칸반.
const SEED: Column[] = [
  {
    name: '계획됨',
    dot: 'bg-on-surface-variant',
    cards: [
      { id: 14, title: '음성 채널 인원 제한 설정 UI', tags: [{ label: '음성', color: 'blue' }, { label: 'UI', color: 'green' }], due: '03.20', assignee: { name: '서', tone: 'amber' } },
      { id: 18, title: '웹훅 보안 모드 시크릿 재발급 플로우', tags: [{ label: '백엔드', color: 'amber' }, { label: '보안', color: 'red' }], assignee: { name: '도', tone: 'green' } },
      { id: 21, title: '파일 채널 갤러리/리스트 뷰 토글', tags: [{ label: '프론트', color: 'blue' }], assignee: { name: '준', tone: 'blue' } },
    ],
  },
  {
    name: '진행중',
    dot: 'bg-cowork-blue-500',
    cards: [
      { id: 42, title: '재연결 로직 리팩터링 — useEffect 의존성', tags: [{ label: '버그', color: 'red' }], due: '03.15', assignee: { name: '도', tone: 'green' } },
      { id: 33, title: '계정 공유 PW 마스킹 권한 게이팅', tags: [{ label: '보안', color: 'red' }, { label: 'UI', color: 'green' }], assignee: { name: '서', tone: 'amber' } },
    ],
  },
  {
    name: '완료됨',
    dot: 'bg-cowork-green-500',
    cards: [
      { id: 40, title: '토스트 프로바이더 명령형 API 추가', tags: [{ label: '완료', color: 'green' }], assignee: { name: '준', tone: 'blue' } },
      { id: 37, title: '다크 테마 토큰 정리 및 Pretendard 적용', tags: [{ label: '디자인', color: 'blue' }], assignee: { name: '도', tone: 'green' } },
    ],
  },
];

export function IssueView() {
  const [columns, setColumns] = useState<Column[]>(SEED);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');

  const create = () => {
    if (!title.trim()) return;
    const nextId = Math.max(0, ...columns.flatMap((c) => c.cards.map((k) => k.id))) + 1;
    const card: Card = {
      id: nextId,
      title: title.trim(),
      tags: tag.trim() ? [{ label: tag.trim(), color: 'blue' }] : [],
      assignee: { name: '준', tone: 'blue' },
    };
    setColumns((prev) =>
      prev.map((c) => (c.name === '계획됨' ? { ...c, cards: [card, ...c.cards] } : c)),
    );
    setTitle('');
    setTag('');
    setOpen(false);
  };

  return (
    <div className="bg-surface-container-high flex h-full flex-col">
      <header className="border-outline-variant flex h-14 shrink-0 items-center justify-between border-b px-5">
        <div className="flex items-center gap-2.5">
          <span className="text-on-surface text-[18px] font-semibold">이슈</span>
          <span className="bg-outline-variant h-[18px] w-px" />
          <span className="text-on-surface-variant text-[14px]">개발 · 백엔드</span>
        </div>
        <div className="flex items-center gap-4">
          <SearchIcon size={20} className="text-on-surface-variant" />
          <Button size="S" onClick={() => setOpen(true)}>
            + 새 이슈
          </Button>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden p-5">
        {columns.map((column) => (
          <div
            key={column.name}
            className="bg-surface flex h-full min-w-0 flex-1 flex-col gap-3 rounded-[12px] px-3 py-3.5"
          >
            <div className="flex items-center gap-2 pl-1">
              <span className={`size-2.5 rounded-full ${column.dot}`} />
              <span className="text-on-surface text-[14px] font-semibold">{column.name}</span>
              <span className="text-on-surface-variant text-[13px] font-semibold">
                {column.cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 overflow-y-auto">
              {column.cards.map((card) => (
                <IssueCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="새 이슈 만들기"
        footer={
          <>
            <Button variant="weak" color="neutral" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={create} disabled={!title.trim()}>
              만들기
            </Button>
          </>
        }
      >
        <TextField
          label="제목"
          placeholder="예: 알림 설정 화면 추가"
          value={title}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
        />
        <TextField
          label="라벨 (선택)"
          placeholder="예: 프론트"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
        />
      </Modal>
    </div>
  );
}

function IssueCard({ card }: { card: Card }) {
  return (
    <button
      type="button"
      className="bg-surface-container flex flex-col gap-2 rounded-[10px] p-3 text-left"
    >
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map((t) => (
            <Badge key={t.label} color={t.color}>
              {t.label}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-on-surface w-full text-[14px] font-medium">{card.title}</p>
      <div className="flex items-center justify-between">
        <span className="text-on-surface-variant text-[12px]">#{card.id}</span>
        <div className="flex items-center gap-2">
          {card.due && <span className="text-on-surface-variant text-[12px]">📅 {card.due}</span>}
          <Avatar name={card.assignee.name} tone={card.assignee.tone} size={20} />
        </div>
      </div>
    </button>
  );
}
