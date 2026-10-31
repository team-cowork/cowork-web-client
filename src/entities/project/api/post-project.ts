import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type CreateProjectRequest,
  type Project,
} from '@/entities/project/model/project';

export async function postProject(
  request: CreateProjectRequest,
): Promise<Project> {
  const { data } = await instance.post<ApiResponse<Project>>(
    '/project/projects',
    request,
  );

  return data.data;
}
