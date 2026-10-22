import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Page, type Project } from '@/entities/project/model/project';

// 팀 프로젝트는 많지 않아 한 번에 받아 사이드바 순서대로 보여준다.
const TEAM_PROJECT_PAGE_SIZE = 100;

/** 팀 프로젝트를 정렬 순서(position)대로 내려준다. */
export async function getTeamProjects(teamId: number): Promise<Project[]> {
  const { data } = await instance.get<ApiResponse<Page<Project>>>(
    '/project/projects',
    { params: { teamId, size: TEAM_PROJECT_PAGE_SIZE } },
  );

  return data.data.content;
}
