import { useEffect, useState } from 'react';

import {
  Avatar,
  type AvatarTone,
  HashIcon,
  MessageComposer,
  MessageItem,
  MoreIcon,
  PaperclipIcon,
  SearchIcon,
  UsersIcon,
} from '@cowork/ui';

import { useActiveChannel } from '../shared/channel-context';

interface Message {
  author: string;
  tone: AvatarTone;
  time: string;
  content: string;
}

// ponytail: 채널별 시연 메시지. 없는 채널은 빈 상태 + 전송으로 채운다.
const SEED_MESSAGES: Record<string, Message[]> = {
  backend: [
    { author: 'junjuny', tone: 'blue', time: '오늘 14:20', content: 'PR #2 재연결 로직 리뷰 부탁드려요. 네트워크 상태 감시 부분이 핵심입니다.' },
    { author: '도윤', tone: 'green', time: '오늘 14:22', content: '확인했어요. useEffect 의존성 배열에 socket 인스턴스가 빠진 것 같은데 한 번 봐주실래요?' },
    { author: '서연', tone: 'amber', time: '오늘 14:25', content: '방금 머지했습니다. CI 통과 확인했고 dev 서버에 반영했어요 🚀' },
    { author: 'junjuny', tone: 'blue', time: '오늘 14:30', content: '감사합니다! 그럼 이슈 #14 클로즈할게요.' },
    { author: '민재', tone: 'red', time: '오늘 14:41', content: '다음 스프린트 칸반에 백로그 카드 3개 추가해뒀어요. 확인 부탁!' },
  ],
  notice: [
    { author: '코웍봇', tone: 'red', time: '오늘 09:00', content: '📢 이번 주 금요일 데모데이 리허설이 있습니다. 전원 참석 부탁드려요.' },
  ],
  general: [
    { author: '서연', tone: 'amber', time: '오늘 10:12', content: '다들 좋은 아침이에요 ☀️' },
    { author: '도윤', tone: 'green', time: '오늘 10:15', content: '오늘 스탠드업 10:30입니다.' },
  ],
  frontend: [
    { author: 'junjuny', tone: 'blue', time: '오늘 13:02', content: 'MFE 라우팅 붙였습니다. 셸에서 채널 전환하면 remote가 prop으로 받아요.' },
  ],
  smalltalk: [{ author: '민재', tone: 'red', time: '어제 22:10', content: '주말에 다들 뭐 하세요? ㅎㅎ' }],
};

const ONLINE: { name: string; tone: AvatarTone }[] = [
  { name: 'junjuny', tone: 'blue' },
  { name: '도윤', tone: 'green' },
  { name: '서연', tone: 'amber' },
];

const OFFLINE: { name: string; tone: AvatarTone }[] = [
  { name: '민재', tone: 'red' },
  { name: '지호', tone: 'neutral' },
];

export function ChatView() {
  const channel = useActiveChannel();
  const [draft, setDraft] = useState('');
  // 탭 이동으로 remote가 언마운트돼도 시연 메시지가 유지되도록 localStorage에 영속.
  const [byChannel, setByChannel] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('demo-chat-messages');
      return saved ? (JSON.parse(saved) as Record<string, Message[]>) : SEED_MESSAGES;
    } catch {
      return SEED_MESSAGES;
    }
  });

  useEffect(() => {
    localStorage.setItem('demo-chat-messages', JSON.stringify(byChannel));
  }, [byChannel]);

  const messages = byChannel[channel.id] ?? [];

  const send = () => {
    const content = draft.trim();
    if (!content) return;
    setByChannel((prev) => ({
      ...prev,
      [channel.id]: [...(prev[channel.id] ?? []), { author: 'junjuny', tone: 'blue', time: '방금', content }],
    }));
    setDraft('');
  };

  return (
    <div className="flex h-full">
      <section className="bg-surface-container-high flex min-w-0 flex-1 flex-col">
        <header className="border-outline-variant flex h-12 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <HashIcon size={22} className="text-on-surface-variant" />
            <span className="text-on-surface text-[16px] font-semibold">{channel.name}</span>
            {channel.description && (
              <>
                <span className="bg-outline-variant h-5 w-px" />
                <span className="text-on-surface-variant text-[13px]">{channel.description}</span>
              </>
            )}
          </div>
          <div className="text-on-surface-variant flex items-center gap-[18px]">
            <SearchIcon size={20} />
            <UsersIcon size={20} />
            <MoreIcon size={20} />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto py-4 pr-4 pl-2">
          {messages.length === 0 ? (
            <div className="text-on-surface-variant flex flex-1 flex-col items-center justify-center gap-1">
              <p className="text-[15px] font-semibold">#{channel.name}</p>
              <p className="text-[13px]">아직 메시지가 없어요. 첫 메시지를 보내보세요.</p>
            </div>
          ) : (
            // justify-end 대신 mt-auto 스페이서 — overflow 스크롤 컨테이너에서 상단 clip 방지.
            <>
              <div className="mt-auto" />
              {messages.map((m, i) => (
                <MessageItem key={i} author={m.author} tone={m.tone} timestamp={m.time} content={m.content} />
              ))}
            </>
          )}
        </div>

        <div className="px-4 pb-6">
          <MessageComposer
            value={draft}
            onChange={setDraft}
            onSend={send}
            placeholder={`#${channel.name}에 메시지 보내기 · Markdown 지원`}
            leading={<PaperclipIcon size={20} className="text-on-surface-variant" />}
          />
        </div>
      </section>

      <aside className="bg-surface flex w-60 shrink-0 flex-col gap-1 px-2 pt-4">
        <MemberSection label="온라인 — 3" members={ONLINE} />
        <MemberSection label="오프라인 — 2" members={OFFLINE} offline />
      </aside>
    </div>
  );
}

function MemberSection({
  label,
  members,
  offline,
}: {
  label: string;
  members: { name: string; tone: AvatarTone }[];
  offline?: boolean;
}) {
  return (
    <>
      <p className="text-on-surface-variant px-2 pt-3 pb-1 text-[12px] font-semibold tracking-[0.5px]">
        {label}
      </p>
      {members.map((member) => (
        <div key={member.name} className="flex h-11 items-center gap-[10px] px-2">
          <Avatar name={member.name} tone={member.tone} size={32} className={offline ? 'opacity-40' : ''} />
          <span
            className={`min-w-0 flex-1 truncate text-[15px] font-medium ${offline ? 'text-on-surface-variant' : 'text-on-surface'}`}
          >
            {member.name}
          </span>
        </div>
      ))}
    </>
  );
}
