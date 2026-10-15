'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { TeamIconField } from '@/features/team-icon/ui/team-icon-field';
import { DeleteTeamSection } from '@/features/team-settings/ui/delete-team-section';
import { TeamProfileForm } from '@/features/team-settings/ui/team-profile-form';
import { teamQueries } from '@/entities/team/api/team-queries';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';

export interface TeamProfileSettingsProps {
  teamId: number;
}

function TeamProfileSettingsError() {
  return (
    <ErrorState
      title="팀 정보를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export function TeamProfileSettings({ teamId }: TeamProfileSettingsProps) {
  return (
    <QueryBoundary
      loadingFallback={<LoadingPane />}
      errorFallback={TeamProfileSettingsError}
      resetKeys={[teamId]}
    >
      <TeamProfileSettingsContent teamId={teamId} />
    </QueryBoundary>
  );
}

function TeamProfileSettingsContent({ teamId }: { teamId: number }) {
  const { data: team } = useSuspenseQuery(teamQueries.detail(teamId));

  return (
    <div className="flex flex-col gap-3.5">
      <SettingsCard title="팀 아이콘">
        <TeamIconField team={team} />
      </SettingsCard>
      <SettingsCard title="기본 정보">
        <TeamProfileForm team={team} />
      </SettingsCard>
      <DeleteTeamSection team={team} />
    </div>
  );
}
