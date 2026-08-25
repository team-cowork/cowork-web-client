'use client';

import { useLogout } from '@/features/logout/model/use-logout';
import { SettingsNavItem } from '@/shared/ui/settings-nav-item';

export function LogoutButton() {
  const { mutate, isPending } = useLogout();

  return (
    <SettingsNavItem danger disabled={isPending} onClick={() => mutate()}>
      로그아웃
    </SettingsNavItem>
  );
}
