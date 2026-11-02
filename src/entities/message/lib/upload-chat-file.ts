import axios from 'axios';

import { postFileConfirm } from '@/entities/message/api/post-file-confirm';
import { postFileUploadUrl } from '@/entities/message/api/post-file-upload-url';
import { type ConfirmedFile } from '@/entities/message/model/message';
import { withDevCredential } from '@/shared/api/dev-credential';

/**
 * 채팅 첨부 파일을 오브젝트 스토리지에 올리고 서버 확인까지 마친다.
 * 확인 결과의 `objectKey`를 메시지 전송에 쓴다.
 */
export async function uploadChatFile(
  channelId: number,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<ConfirmedFile> {
  const contentType = file.type || 'application/octet-stream';
  const { objectKey, uploadUrl, headers } = await postFileUploadUrl(channelId, {
    filename: file.name,
    contentType,
    size: file.size,
  });

  await axios.put(withDevCredential(uploadUrl), file, {
    headers: { 'Content-Type': contentType, ...headers },
    onUploadProgress: ({ loaded, total }) => {
      if (total) onProgress?.((loaded / total) * 100);
    },
  });

  return postFileConfirm(channelId, objectKey);
}
