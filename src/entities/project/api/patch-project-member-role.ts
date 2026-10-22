import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type AssignableProjectMemberRole,
  type ProjectMember,
} from '@/entities/project/model/project';

/** `memberId`는 사용자 ID가 아니라 멤버 레코드 ID다. */
export async function patchProjectMemberRole(
  projectId: number,
  memberId: number,
  role: AssignableProjectMemberRole,
): Promise<ProjectMember> {
  const { data } = await instance.patch<ApiResponse<ProjectMember>>(
    `/project/projects/${projectId}/members/${memberId}`,
    { role },
  );

  return data.data;
}
