import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ProjectMember } from '@/entities/project/model/project';

export async function getProjectMembers(
  projectId: number,
): Promise<ProjectMember[]> {
  const { data } = await instance.get<ApiResponse<ProjectMember[]>>(
    `/project/projects/${projectId}/members`,
  );

  return data.data;
}
