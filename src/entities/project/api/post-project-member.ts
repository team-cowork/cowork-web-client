import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type AddProjectMemberRequest,
  type ProjectMember,
} from '@/entities/project/model/project';

/** 팀 멤버만 추가할 수 있고, OWNER 역할은 줄 수 없다. */
export async function postProjectMember(
  projectId: number,
  request: AddProjectMemberRequest,
): Promise<ProjectMember> {
  const { data } = await instance.post<ApiResponse<ProjectMember>>(
    `/project/projects/${projectId}/members`,
    request,
  );

  return data.data;
}
