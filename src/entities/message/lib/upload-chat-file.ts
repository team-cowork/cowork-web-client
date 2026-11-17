import axios from 'axios';

import { postFileConfirm } from '@/entities/message/api/post-file-confirm';
import { postFileUploadUrl } from '@/entities/message/api/post-file-upload-url';
import { type ConfirmedFile } from '@/entities/message/model/message';
import { withDevCredential } from '@/shared/api/dev-credential';

/** prepare: 업로드 URL 발급 · storage: 스토리지 PUT · confirm: 서버 확인 */
export type ChatFileUploadStep = 'prepare' | 'storage' | 'confirm';

/**
 * 어느 단계에서 실패했는지 함께 넘긴다.
 * 같은 상태 코드라도 단계마다 뜻이 달라서(예: 스토리지 403은 서명 불일치) 안내 문구를 다르게 고른다.
 */
export class ChatFileUploadError extends Error {
  constructor(
    readonly step: ChatFileUploadStep,
    readonly original: unknown,
  ) {
    super(`채팅 첨부 업로드 실패 (${step})`);
    this.name = 'ChatFileUploadError';
  }
}

async function runStep<T>(
  step: ChatFileUploadStep,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw new ChatFileUploadError(step, error);
  }
}

/**
 * 채팅 첨부 파일을 오브젝트 스토리지에 올리고 서버 확인까지 마친다.
 * 확인 결과의 `objectKey`를 메시지 전송에 쓴다.
 * `signal`로 취소하면 남은 단계를 진행하지 않아 확인되지 않은 파일은 메시지에 붙지 않는다.
 */
export async function uploadChatFile(
  channelId: number,
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<ConfirmedFile> {
  // 서버는 매개변수 없는 type/subtype만 받고, OS가 모르는 형식은 File.type이 비어 있다
  const contentType =
    file.type.split(';')[0]?.trim() || 'application/octet-stream';
  const { objectKey, uploadUrl, headers } = await runStep('prepare', () =>
    postFileUploadUrl(
      channelId,
      { filename: file.name, contentType, size: file.size },
      signal,
    ),
  );

  await runStep('storage', () =>
    axios.put(withDevCredential(uploadUrl), file, {
      signal,
      headers: { 'Content-Type': contentType, ...headers },
      onUploadProgress: ({ loaded, total }) => {
        if (total) onProgress?.((loaded / total) * 100);
      },
    }),
  );

  return runStep('confirm', () =>
    postFileConfirm(channelId, objectKey, signal),
  );
}
