import { type TeamRole } from '@/entities/team/model/team';

export const ADMINISTRATOR = 'administrator';
export const TRANSFER_TEAM_OWNERSHIP = 'transfer_team_ownership';

/**
 * 서버 RolePolicy.allows와 같은 규칙. 역할 이름은 보지 않고 정책만 본다.
 * administrator는 소유권 이양을 뺀 모든 권한을 허용한다.
 */
export function allowsTeamPermission(
  roles: TeamRole[],
  permission: string,
): boolean {
  return roles.some(
    (role) =>
      role.permissions[permission] === true ||
      (permission !== TRANSFER_TEAM_OWNERSHIP &&
        role.permissions[ADMINISTRATOR] === true),
  );
}

/** 소유자 정책 역할. 소유권 이양으로만 바뀌어 직접 수정·삭제·부여할 수 없다 */
export function isOwnerPolicyRole(role: TeamRole): boolean {
  return role.permissions[TRANSFER_TEAM_OWNERSHIP] === true;
}
