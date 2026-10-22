import { instance } from '@/shared/api/instance';

export async function deleteProject(projectId: number): Promise<void> {
  await instance.delete(`/project/projects/${projectId}`);
}
