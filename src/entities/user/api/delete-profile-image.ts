import { instance } from '@/shared/api/instance';

export async function deleteProfileImage(): Promise<void> {
  await instance.delete('/user/users/me/profile-image');
}
