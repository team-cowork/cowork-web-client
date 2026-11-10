import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Page, type Project } from '@/entities/project/model/project';

const MY_PROJECT_PAGE_SIZE = 100;

/** 내가 멤버로 참여 중인 모든 팀의 프로젝트 */
export async function getMyProjects(): Promise<Project[]> {
  const { data } = await instance.get<ApiResponse<Page<Project>>>(
    '/project/projects/me',
    { params: { size: MY_PROJECT_PAGE_SIZE } },
  );

  return data.data.content;
}
