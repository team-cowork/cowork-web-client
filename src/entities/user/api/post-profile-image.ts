import axios from 'axios';

import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type ProfileImagePresignedResponse } from '@/entities/user/model/user';

export async function postProfileImage(file: File): Promise<void> {
  const { data } = await instance.post<ApiResponse<ProfileImagePresignedResponse>>(
    '/users/me/profile-image/presigned',
    { content_type: file.type },
  );
  const { object_key, upload_url } = data.data;

  await axios.put(upload_url, file, { headers: { 'Content-Type': file.type } });

  await instance.post('/users/me/profile-image/confirm', { object_key });
}
