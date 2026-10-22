export const PROJECT_STATUSES = ['ACTIVE', 'ARCHIVED'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: '진행 중',
  ARCHIVED: '보관됨',
};

export const PROJECT_MEMBER_ROLES = ['OWNER', 'EDITOR', 'VIEWER'] as const;

export type ProjectMemberRole = (typeof PROJECT_MEMBER_ROLES)[number];

export const PROJECT_MEMBER_ROLE_LABEL: Record<ProjectMemberRole, string> = {
  OWNER: '소유자',
  EDITOR: '편집자',
  VIEWER: '뷰어',
};

/** 멤버 추가·역할 변경으로 고를 수 있는 역할. OWNER는 부여할 수 없다. */
export const ASSIGNABLE_PROJECT_MEMBER_ROLES = ['EDITOR', 'VIEWER'] as const;

export type AssignableProjectMemberRole =
  (typeof ASSIGNABLE_PROJECT_MEMBER_ROLES)[number];

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

export interface ProjectMember {
  /** 멤버 레코드 ID. 역할 변경·제거 경로에 쓴다. */
  id: number;
  projectId: number;
  userId: number;
  role: ProjectMemberRole;
  joinedAt: string;
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

export interface AddProjectMemberRequest {
  userId: number;
  role: AssignableProjectMemberRole;
}
