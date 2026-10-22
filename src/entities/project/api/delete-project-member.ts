import { instance } from '@/shared/api/instance';

/** `memberId`는 사용자 ID가 아니라 멤버 레코드 ID다. OWNER는 제거할 수 없다. */
export async function deleteProjectMember(
  projectId: number,
  memberId: number,
): Promise<void> {
  await instance.delete(`/project/projects/${projectId}/members/${memberId}`);
}
