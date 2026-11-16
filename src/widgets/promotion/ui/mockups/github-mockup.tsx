'use client';

import { type ReactNode, useState } from 'react';

import { motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';
import { GithubIcon } from '@/shared/ui/icons/github-icon';
import {
  MockAvatar,
  MockupFrame,
  POP_IN,
} from '@/widgets/promotion/ui/mockups/mockup-kit';

type Tab = 'conversation' | 'commits' | 'files';
type PrState = 'blocked' | 'approved' | 'merged';

const MY_AVATAR = 68;

const PR_OPEN =
  'M5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v5.256a2.251 2.251 0 1 0 1.5 0zm5.625-.872a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zm.75-2.122a2.25 2.25 0 0 0-.75 4.372V8.5a2.5 2.5 0 0 1-2.5 2.5h-.5a.75.75 0 0 0 0 1.5h.5a4 4 0 0 0 4-4V6.622a2.251 2.251 0 0 0-.75-4.372z';
const PR_MERGED =
  'M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218zM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM4.25 4a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z';
const COMMIT =
  'M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0z';
const CHECK =
  'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 1.042-1.042L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z';
const LOCK =
  'M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25zM10.5 6V4a2.5 2.5 0 1 0-5 0v2z';

const COMMITS = [
  { message: 'feat: JWT 발급 로직 추가', sha: 'a1f3c9e' },
  { message: 'test: 인증 단위 테스트 추가', sha: '7bd20e4' },
  { message: 'fix: 토큰 만료 시간 설정화', sha: 'e94c1aa' },
];

const DIFF_LINES = [
  { kind: 'ctx', num: 12, code: '  const payload = { sub: user.id };' },
  { kind: 'del', num: 13, code: "- const expiresIn = '1h';" },
  { kind: 'add', num: 13, code: '+ const expiresIn = config.jwt.expiresIn;' },
  { kind: 'add', num: 14, code: '+ if (!user) throw new UnauthorizedError();' },
  {
    kind: 'ctx',
    num: 15,
    code: '  return this.jwt.sign(payload, { expiresIn });',
  },
] as const;

function Octicon({ path, size = 9 }: { path: string; size?: number }) {
  return (
    <svg fill="currentColor" width={size} height={size} viewBox="0 0 16 16">
      <path d={path} />
    </svg>
  );
}

function TimelineIcon({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500',
        className,
      )}
    >
      <Octicon path={path} />
    </span>
  );
}

function TimelineItem({
  reveal,
  children,
}: {
  reveal?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={reveal ? POP_IN.initial : false}
      animate={POP_IN.animate}
      transition={POP_IN.transition}
      className="flex items-start gap-2 text-[9px] leading-[1.45] text-gray-500 [&_b]:text-gray-800"
    >
      {children}
    </motion.div>
  );
}

function Comment({
  name,
  when,
  children,
}: {
  name: string;
  when: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-md border border-gray-200 px-1.5 py-1">
      <p>
        <b>{name}</b> <span className="text-gray-300">{when}</span>
      </p>
      <p className="text-gray-700">{children}</p>
    </div>
  );
}

const REVIEW_TEXT = (
  <>
    <span className="font-mono">user.id</span> 접근 전에 null 체크가 필요해
    보여요
  </>
);

const PR_BUTTON =
  'h-[22px] shrink-0 cursor-pointer rounded-md px-2.5 text-[10px] font-bold';

function MergeRow({
  icon,
  iconClass,
  title,
  description,
  children,
}: {
  icon: string;
  iconClass: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full text-white',
          iconClass,
        )}
      >
        <Octicon path={icon} size={10} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-bold text-gray-800">{title}</p>
        <p className="truncate text-[9px] text-gray-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function GithubMockup() {
  const [tab, setTab] = useState<Tab>('conversation');
  const [pr, setPr] = useState<PrState>('blocked');
  const [isReviewed, setIsReviewed] = useState(false);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'conversation', label: '대화' },
    { id: 'commits', label: '커밋', count: COMMITS.length },
    { id: 'files', label: '변경 파일', count: 1 },
  ];

  return (
    <MockupFrame>
      <div className="px-4 pt-3 pb-2">
        <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] text-gray-400">
          <GithubIcon size={11} />
          orbit-labs / auth-service
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-[3px] rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white',
              pr === 'merged' ? 'bg-[#8250df]' : 'bg-[#1f883d]',
            )}
          >
            <Octicon path={pr === 'merged' ? PR_MERGED : PR_OPEN} size={8} />
            {pr === 'merged' ? 'Merged' : 'Open'}
          </span>
          <span className="truncate text-[11px] font-bold text-gray-800">
            feat: 사용자 인증 API 추가{' '}
            <span className="text-gray-300">#42</span>
          </span>
        </div>
      </div>

      <div className="flex gap-3 border-b border-gray-100 px-4">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            tabIndex={-1}
            onClick={() => setTab(id)}
            className={cn(
              '-mb-px inline-flex cursor-pointer items-center gap-1 border-b-2 py-1.5 text-[10px] font-semibold transition-colors',
              tab === id
                ? 'border-(--accent) text-gray-800'
                : 'border-transparent text-gray-400',
            )}
          >
            {label}
            {count !== undefined && (
              <span className="rounded-full bg-gray-100 px-[5px] text-[8px] text-gray-500">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mock-scroll min-h-0 flex-1 overflow-y-auto px-4 py-2.5">
        {tab === 'conversation' && (
          <div className="flex flex-col gap-2">
            <TimelineItem>
              <MockAvatar img={5} size={16} />
              <Comment name="Emma" when="2시간 전">
                <span className="font-mono">feat/auth</span> →{' '}
                <span className="font-mono">develop</span> 병합을 요청합니다
              </Comment>
            </TimelineItem>
            <TimelineItem>
              <TimelineIcon path={COMMIT} />
              <p className="min-w-0">
                <b>Emma</b> 님이 커밋 3개를 푸시했습니다
              </p>
            </TimelineItem>
            <TimelineItem>
              <MockAvatar img={33} size={16} />
              <Comment name="Liam" when="1시간 전">
                토큰 만료 시간은 설정으로 빼면 좋겠어요
              </Comment>
            </TimelineItem>
            <TimelineItem>
              <MockAvatar img={5} size={16} />
              <Comment name="Emma" when="30분 전">
                반영했습니다! 다시 확인 부탁드려요
              </Comment>
            </TimelineItem>
            <TimelineItem>
              <TimelineIcon path={CHECK} className="bg-[#1f883d] text-white" />
              <p className="min-w-0">검사 2개 통과 · 충돌 없음</p>
            </TimelineItem>
            {isReviewed && (
              <TimelineItem reveal>
                <MockAvatar img={MY_AVATAR} size={16} />
                <Comment name="나" when="코드 리뷰 · 방금">
                  {REVIEW_TEXT}
                </Comment>
              </TimelineItem>
            )}
            {pr !== 'blocked' && (
              <TimelineItem reveal>
                <TimelineIcon
                  path={CHECK}
                  className="bg-[#1f883d] text-white"
                />
                <p className="min-w-0">
                  <b>나</b> 님이 변경 사항을 승인했습니다
                </p>
              </TimelineItem>
            )}
            {pr === 'merged' && (
              <TimelineItem reveal>
                <TimelineIcon
                  path={PR_MERGED}
                  className="bg-[#8250df] text-white"
                />
                <p className="min-w-0">
                  <b>나</b> 님이 <span className="font-mono">develop</span>에
                  병합했습니다
                </p>
              </TimelineItem>
            )}
          </div>
        )}

        {tab === 'commits' && (
          <div>
            {COMMITS.map((commit) => (
              <div
                key={commit.sha}
                className="flex items-center gap-2 border-b border-gray-100 py-[5px] text-[9px]"
              >
                <TimelineIcon path={COMMIT} />
                <span className="min-w-0 flex-1 truncate text-gray-700">
                  {commit.message}
                </span>
                <MockAvatar img={5} size={16} />
                <span className="font-mono text-[8px] text-gray-400">
                  {commit.sha}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'files' && (
          <div>
            <div className="overflow-hidden rounded-md border border-gray-200 font-mono text-[8px]">
              <div className="flex justify-between gap-2 border-b border-gray-200 bg-gray-50 px-1.5 py-1 text-gray-700">
                <span className="truncate">src/auth/token.service.ts</span>
                <span>
                  <span className="text-[#1a7f37]">+2</span>
                  <span className="text-[#cf222e]">−1</span>
                </span>
              </div>
              <div>
                {DIFF_LINES.map((line, index) => (
                  <div key={`${line.kind}-${line.num}`}>
                    <div
                      onClick={() => setIsReviewed(true)}
                      className={cn(
                        'flex cursor-pointer gap-1.5 px-1.5 py-px whitespace-pre transition-colors hover:bg-(--accent)/12',
                        line.kind === 'add' && 'bg-[#e6ffec]',
                        line.kind === 'del' && 'bg-[#ffebe9]',
                      )}
                    >
                      <span className="w-3.5 shrink-0 text-right text-gray-400">
                        {line.num}
                      </span>
                      <span className="truncate">{line.code}</span>
                    </div>
                    {isReviewed && index === 3 && (
                      <motion.div
                        {...POP_IN}
                        className="mx-1.5 my-[3px] flex items-start gap-1.5 rounded-md border border-gray-200 bg-white px-1.5 py-1 font-sans text-[9px] whitespace-normal text-gray-600"
                      >
                        <MockAvatar img={MY_AVATAR} size={16} />
                        <p>
                          <b className="text-gray-800">나</b> {REVIEW_TEXT}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {!isReviewed && (
              <p className="mt-1.5 text-center text-[8px] text-gray-400">
                코드 줄을 눌러 리뷰를 남겨 보세요
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-2">
        {pr === 'blocked' && (
          <MergeRow
            icon={LOCK}
            iconClass="bg-[#cf222e]"
            title="병합이 차단되었습니다"
            description="Ruleset · 승인 1개가 필요합니다"
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                setPr('approved');
                setTab('conversation');
              }}
              className={cn(PR_BUTTON, 'bg-(--accent) text-white')}
            >
              승인
            </button>
            <button
              type="button"
              tabIndex={-1}
              className={cn(
                PR_BUTTON,
                'cursor-not-allowed bg-gray-100 text-gray-400',
              )}
            >
              Merge
            </button>
          </MergeRow>
        )}
        {pr === 'approved' && (
          <MergeRow
            icon={CHECK}
            iconClass="bg-[#1f883d]"
            title="병합할 수 있습니다"
            description="모든 규칙을 충족했습니다"
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                setPr('merged');
                setTab('conversation');
              }}
              className={cn(PR_BUTTON, 'bg-[#1f883d] text-white')}
            >
              Merge
            </button>
          </MergeRow>
        )}
        {pr === 'merged' && (
          <MergeRow
            icon={PR_MERGED}
            iconClass="bg-[#8250df]"
            title="병합 완료"
            description={
              <>
                <span className="font-mono">feat/auth</span> 브랜치를 삭제할 수
                있습니다
              </>
            }
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setPr('blocked')}
              className={cn(PR_BUTTON, 'bg-gray-100 text-gray-700')}
            >
              Revert
            </button>
          </MergeRow>
        )}
      </div>
    </MockupFrame>
  );
}
