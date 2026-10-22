import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ProjectDetail } from '@/entities/project/model/project';

export async function getProject(projectId: number): Promise<ProjectDetail> {
  const { data } = await instance.get<ApiResponse<ProjectDetail>>(
    `/project/projects/${projectId}`,
  );

  return data.data;
}
