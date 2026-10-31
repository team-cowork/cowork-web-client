import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Project } from '@/entities/project/model/project';

export async function patchTeamProjectsOrder(
  teamId: number,
  orderedProjectIds: number[],
): Promise<Project[]> {
  const { data } = await instance.patch<ApiResponse<Project[]>>(
    `/project/teams/${teamId}/projects/reorder`,
    { orderedProjectIds },
  );

  return data.data;
}
