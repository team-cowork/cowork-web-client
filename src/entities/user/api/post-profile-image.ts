import axios from 'axios';

import { withDevCredential } from '@/shared/api/dev-credential';
import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ProfileImagePresignedResponse } from '@/entities/user/model/user';

export async function postProfileImage(file: File): Promise<void> {
  const { data } = await instance.post<
    ApiResponse<ProfileImagePresignedResponse>
  >('/user/users/me/profile-image/presigned', { content_type: file.type });
  const { object_key, upload_url } = data.data;

  await axios.put(withDevCredential(upload_url), file, {
    headers: { 'Content-Type': file.type },
  });

  await instance.post('/user/users/me/profile-image/confirm', { object_key });
}
