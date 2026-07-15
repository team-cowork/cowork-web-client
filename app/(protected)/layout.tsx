import { type ReactNode } from 'react';

import { AuthGuard } from '@/features/auth/ui/auth-guard';

/**
 * 인증이 필요한 라우트 그룹. 여기 속한 페이지는 AuthGuard를 통과해야 렌더링된다.
 * 공개 라우트(/signin, /auth/callback, /auth/error)는 이 그룹 밖에 두어 가드를 받지 않는다.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
