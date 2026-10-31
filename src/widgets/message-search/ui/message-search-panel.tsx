'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { messageQueries } from '@/entities/message/api/message-queries';
import { formatMessageTime } from '@/entities/message/lib/format-message-time';
import { type SearchMessageItem } from '@/entities/message/model/message';
import { useMessageAuthor } from '@/entities/message/model/use-message-author';
import { SearchHighlight } from '@/entities/message/ui/search-highlight';
import { cn } from '@/shared/lib/cn';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { channelPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { SegmentedControl } from '@/shared/ui/segmented-control';

export interface MessageSearchPanelProps {
  teamId: number;
  channelId: number;
  /** 채널이 프로젝트에 속해 있으면 프로젝트 범위 검색을 고를 수 있다 */
  projectId: number | null;
  onClose: () => void;
  className?: string;
}

type SearchScope = 'channel' | 'project' | 'team';

const STATUS_TEXT_CLASS =
  'px-2 py-2 typography-subtext-medium text-on-surface-variant';

export function MessageSearchPanel({
  teamId,
  channelId,
  projectId,
  onClose,
  className,
}: MessageSearchPanelProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [scope, setScope] = useState<SearchScope>('channel');
  const [filesOnly, setFilesOnly] = useState(false);
  const q = useDebouncedValue(keyword.trim());

  const { data: channels } = useQuery(channelQueries.byTeam(teamId));
  const channelName = (id: number) =>
    channels?.find((channel) => channel.id === id)?.name ?? '알 수 없는 채널';

  const results = useInfiniteQuery(
    messageQueries.search(
      {
        teamId,
        projectId:
          scope === 'project' && projectId !== null ? projectId : undefined,
      },
      {
        q,
        channelId: scope === 'channel' ? channelId : undefined,
        hasFile: filesOnly || undefined,
      },
    ),
  );
  const items = results.data?.pages.flatMap((page) => page.messages) ?? [];

  const scopeOptions = [
    { label: '이 채널', value: 'channel' as const },
    ...(projectId !== null
      ? [{ label: '프로젝트', value: 'project' as const }]
      : []),
    { label: '팀 전체', value: 'team' as const },
  ];

  return (
    <aside
      aria-label="메시지 검색"
      className={cn(
        'flex w-100 shrink-0 flex-col border-l border-outline-variant bg-surface',
        className,
      )}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-outline-variant pr-3.5 pl-4">
        <h2 className="typography-label-small text-on-surface">메시지 검색</h2>
        <button
          type="button"
          aria-label="검색 닫기"
          onClick={onClose}
          className="cursor-pointer text-on-surface-variant hover:text-on-surface"
        >
          <CloseIcon size={18} />
        </button>
      </header>

      <div className="flex shrink-0 flex-col gap-2.5 border-b border-outline-variant p-3">
        <label className="flex h-10 items-center gap-2 rounded-[12px] border border-outline-variant bg-background px-3 focus-within:border-primary">
          <SearchIcon size={16} className="shrink-0 text-on-surface-variant" />
          <input
            autoFocus
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="검색어를 입력하세요"
            aria-label="검색어"
            className="min-w-0 flex-1 bg-transparent typography-subtext-large text-on-surface placeholder:text-on-surface-variant focus:outline-none"
          />
        </label>
        <div className="flex items-center justify-between gap-2">
          <SegmentedControl
            options={scopeOptions}
            value={scope}
            onChange={setScope}
          />
          <label className="flex cursor-pointer items-center gap-1.5 typography-subtext-medium text-on-surface-variant">
            <input
              type="checkbox"
              checked={filesOnly}
              onChange={(event) => setFilesOnly(event.target.checked)}
              className="accent-primary"
            />
            파일만
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {q.length === 0 ? (
          <p className={STATUS_TEXT_CLASS}>
            찾을 단어를 입력하면 메시지를 검색해요.
          </p>
        ) : results.isPending ? (
          <p className={STATUS_TEXT_CLASS}>검색하는 중…</p>
        ) : results.isError ? (
          <p className={cn(STATUS_TEXT_CLASS, 'flex items-center gap-2')}>
            검색하지 못했어요
            <button
              type="button"
              onClick={() => void results.refetch()}
              className="cursor-pointer typography-label-x-small underline"
            >
              다시 시도
            </button>
          </p>
        ) : items.length === 0 ? (
          <p className={STATUS_TEXT_CLASS}>
            &lsquo;{q}&rsquo;에 맞는 메시지가 없어요.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li key={item.messageId}>
                  <SearchResult
                    item={item}
                    channelName={channelName(item.channelId)}
                    onSelect={() =>
                      router.push(channelPath(teamId, item.channelId))
                    }
                  />
                </li>
              ))}
            </ul>
            {results.hasNextPage && (
              <div className="flex justify-center py-3">
                <Button
                  size="S"
                  variant="weak"
                  disabled={results.isFetchingNextPage}
                  onClick={() => void results.fetchNextPage()}
                >
                  {results.isFetchingNextPage ? '불러오는 중…' : '더 보기'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function SearchResult({
  item,
  channelName,
  onSelect,
}: {
  item: SearchMessageItem;
  channelName: string;
  onSelect: () => void;
}) {
  const author = useMessageAuthor(item.authorId);
  const [snippet] = item.highlight;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full cursor-pointer flex-col gap-1 rounded-[10px] px-2 py-2 text-left hover:bg-surface-container"
    >
      <span className="typography-label-x-small text-on-surface-variant">
        # {channelName} · {author.name && `${author.name} · `}
        {formatMessageTime(item.createdAt)}
      </span>
      <SearchHighlight
        snippet={snippet ?? item.content}
        className="line-clamp-3 typography-subtext-medium text-on-surface"
      />
    </button>
  );
}
