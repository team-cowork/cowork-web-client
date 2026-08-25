'use client';

import { useState } from 'react';

import { useLogout } from '@/features/logout/model/use-logout';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { SettingsNavItem } from '@/shared/ui/settings-nav-item';

export function LogoutButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending } = useLogout();

  return (
    <>
      <SettingsNavItem danger onClick={() => setConfirmOpen(true)}>
        로그아웃
      </SettingsNavItem>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="로그아웃할까요?"
        description="다시 이용하려면 로그인해야 해요."
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={isPending}
          onClick={() => setConfirmOpen(false)}
        >
          취소
        </Button>
        <Button
          type="button"
          color="danger"
          disabled={isPending}
          onClick={() => mutate()}
        >
          {isPending ? '로그아웃 중…' : '로그아웃'}
        </Button>
      </Dialog>
    </>
  );
}
