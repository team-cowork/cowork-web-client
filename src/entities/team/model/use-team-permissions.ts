'use client';

import { useQuery } from '@tanstack/react-query';

import { teamQueries } from '@/entities/team/api/team-queries';
import {
  ADMINISTRATOR,
  allowsTeamPermission,
} from '@/entities/team/lib/team-permission';
import { type TeamRole } from '@/entities/team/model/team';
import { userQueries } from '@/entities/user/api/user-queries';

export interface TeamPermissions {
  /** 내 역할을 모두 불러왔는지. 불러오기 전에는 모든 권한을 false로 본다 */
  ready: boolean;
  isAdministrator: boolean;
  /** 내 역할 중 가장 높은 우선순위. 이보다 낮은 역할만 관리할 수 있다 */
  maxPriority: number;
  /** 내 역할 중 하나라도 직접 켜 둔 권한 키. 남에게 부여할 수 있는 범위다 */
  grantedKeys: ReadonlySet<string>;
  can: (permission: string) => boolean;
}

/**
 * 팀에서 내가 가진 권한. 서버처럼 기본 역할(@everyone)과 부여받은 역할의 정책을 합산한다.
 * 화면을 막는 용도일 뿐이고 실제 인가는 서버가 한다.
 */
export function useTeamPermissions(teamId: number): TeamPermissions {
  const { data: me } = useQuery(userQueries.me());
  const { data: roles } = useQuery(teamQueries.roles(teamId));
  const { data: assignedRoles } = useQuery({
    ...teamQueries.memberRoles(teamId, me?.id ?? 0),
    enabled: me != null,
  });

  if (!roles || !assignedRoles) {
    return {
      ready: false,
      isAdministrator: false,
      maxPriority: Number.MIN_SAFE_INTEGER,
      grantedKeys: new Set(),
      can: () => false,
    };
  }

  const myRoles: TeamRole[] = [
    ...roles.filter((role) => role.isDefault),
    ...assignedRoles,
  ];

  return {
    ready: true,
    isAdministrator: allowsTeamPermission(myRoles, ADMINISTRATOR),
    maxPriority: Math.max(...myRoles.map((role) => role.priority)),
    grantedKeys: new Set(
      myRoles.flatMap((role) =>
        Object.entries(role.permissions)
          .filter(([, allowed]) => allowed)
          .map(([key]) => key),
      ),
    ),
    can: (permission) => allowsTeamPermission(myRoles, permission),
  };
}
