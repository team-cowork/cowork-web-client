import { instance } from '@/shared/api/instance';

export async function deleteProfileImage(): Promise<void> {
  await instance.delete('/users/me/profile-image');
}
