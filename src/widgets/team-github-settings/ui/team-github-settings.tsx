'use client';

import { useState } from 'react';

import { useGithubAppInstall } from '@/features/github-app-install/model/use-github-app-install';
import { useTeamPermissions } from '@/entities/team/model/use-team-permissions';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { SettingsCard } from '@/shared/ui/settings-card';

export function TeamGithubSettings({ teamId }: { teamId: number }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { install, uninstall } = useGithubAppInstall(teamId);
  const canManage = useTeamPermissions(teamId).can('manage_github');

  return (
    <>
      <SettingsCard title="GitHub App 연동">
        <div className="flex flex-col gap-4">
          <p className="typography-subtext-medium text-on-surface-variant">
            팀의 GitHub 조직에 앱을 연결하면 프로젝트 저장소를 연동하고 PR
            보드와 알림을 사용할 수 있어요.
          </p>
          <p className="typography-subtext-small text-on-surface-variant">
            현재 연결 상태를 확인할 수 없어요. GitHub App을 설치하거나 기존
            연동을 해제할 수 있어요.
          </p>
          {canManage && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => install.mutate()}
                disabled={install.isPending || uninstall.isPending}
              >
                {install.isPending ? '설치 주소를 여는 중…' : 'GitHub App 설치'}
              </Button>
              <Button
                type="button"
                variant="weak"
                color="danger"
                onClick={() => setConfirmOpen(true)}
                disabled={uninstall.isPending || install.isPending}
              >
                연동 해제
              </Button>
            </div>
          )}
        </div>
      </SettingsCard>
      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!uninstall.isPending) setConfirmOpen(false);
        }}
        title="GitHub 연동을 해제할까요?"
        description="팀 프로젝트에서 GitHub 저장소와 PR 정보를 더 이상 사용할 수 없어요."
      >
        <Button
          variant="weak"
          color="neutral"
          disabled={uninstall.isPending}
          onClick={() => setConfirmOpen(false)}
        >
          취소
        </Button>
        <Button
          color="danger"
          disabled={uninstall.isPending}
          onClick={() =>
            uninstall.mutate(undefined, {
              onSuccess: () => setConfirmOpen(false),
            })
          }
        >
          {uninstall.isPending ? '해제하는 중…' : '연동 해제'}
        </Button>
      </Dialog>
    </>
  );
}
