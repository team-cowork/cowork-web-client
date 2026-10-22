import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type Project,
  type UpdateProjectRequest,
} from '@/entities/project/model/project';

export async function patchProject(
  projectId: number,
  request: UpdateProjectRequest,
): Promise<Project> {
  const { data } = await instance.patch<ApiResponse<Project>>(
    `/project/projects/${projectId}`,
    request,
  );

  return data.data;
}
