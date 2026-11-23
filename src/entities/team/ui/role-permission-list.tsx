'use client';

import { useState } from 'react';

import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { teamQueries } from '@/entities/team/api/team-queries';
import { cn } from '@/shared/lib/cn';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { SearchIcon } from '@/shared/ui/icons/search-icon';
import { Switch } from '@/shared/ui/switch';
import { TextField } from '@/shared/ui/text-field';

export interface RolePermissionListProps {
  channelType?: string;
  permissions: Record<string, boolean>;
  disabled: boolean;
  onCheckedChange: (key: string, allowed: boolean) => void;
}

export function RolePermissionList({
  channelType,
  permissions,
  disabled,
  onCheckedChange,
}: RolePermissionListProps) {
  const { data: allGroups } = useSuspenseQuery(
    teamQueries.rolePermissions({ channelType }),
  );
  const [keyword, setKeyword] = useState('');
  const query = useDebouncedValue(keyword.trim());
  const searched = useQuery({
    ...teamQueries.rolePermissions({ channelType, query }),
    enabled: query.length > 0,
    placeholderData: keepPreviousData,
  });
  const groups = query ? (searched.data ?? allGroups) : allGroups;
  const searchFailed = query.length > 0 && searched.isError;
  const searching = keyword.trim() !== query || searched.isFetching;

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        <TextField
          aria-label="권한 검색"
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="권한 이름, 설명, 키로 검색하세요"
          maxLength={50}
        />
        <p
          role="status"
          aria-live="polite"
          className="absolute top-full mt-2 flex items-center gap-1.5 typography-subtext-medium text-on-surface-variant"
        >
          {searching && (
            <>
              <span className="size-3 animate-spin rounded-full border-2 border-outline border-t-primary" />
              검색 중…
            </>
          )}
        </p>
      </div>

      {searchFailed && (
        <ErrorState
          title="권한을 검색하지 못했어요"
          description="잠시 후 다시 시도해 주세요."
        />
      )}

      {!searchFailed && groups.length === 0 && (
        <EmptyState
          icon={<SearchIcon />}
          title="검색 결과가 없어요"
          description="다른 검색어로 찾아 보세요"
        />
      )}

      {!searchFailed &&
        groups.map((group) => (
          <section
            key={group.key}
            aria-busy={searching}
            className={cn(
              'flex flex-col transition-opacity',
              searching && 'opacity-50',
            )}
          >
            <h2 className="pb-2 typography-title-small text-on-surface">
              {group.title}
            </h2>
            <ul className="flex flex-col">
              {group.permissions.map((permission) => (
                <li
                  key={permission.key}
                  className="flex items-center justify-between gap-6 border-b border-outline-variant py-4 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="typography-body-medium-strong text-on-surface">
                      {permission.title}
                    </span>
                    <span className="typography-subtext-medium text-on-surface-variant">
                      {permission.description}
                    </span>
                  </div>
                  <Switch
                    aria-label={permission.title}
                    checked={permissions[permission.key] === true}
                    disabled={disabled}
                    onCheckedChange={(allowed) =>
                      onCheckedChange(permission.key, allowed)
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
