export const PROJECT_STATUSES = ['ACTIVE', 'ARCHIVED'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: '진행 중',
  ARCHIVED: '보관됨',
};

export interface Project {
  id: number;
  teamId: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  position: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  memberCount: number;
}

/** 팀 역할로 계산된 프로젝트 접근자. 프로젝트 단위 멤버 관리는 없다. */
export interface ProjectMember {
  projectId: number;
  userId: number;
  /** 프로젝트를 수정할 수 있는지 */
  write: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface CreateProjectRequest {
  teamId: number;
  name: string;
  description?: string | null;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
}
