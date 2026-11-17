import { create } from 'zustand';

import { uploadChatFile } from '@/entities/message/lib/upload-chat-file';
import { type ConfirmedFile } from '@/entities/message/model/message';
import { toUploadError } from '@/features/message-attachment/lib/to-upload-error';
import { createUuid } from '@/shared/lib/create-uuid';

export type AttachmentUploadStatus =
  'uploading' | 'done' | 'sending' | 'failed';

export interface AttachmentUpload {
  id: string;
  file: File;
  progress: number;
  status: AttachmentUploadStatus;
  confirmed?: ConfirmedFile;
  /** 실패했을 때 사용자에게 보여 줄 이유 */
  error?: string;
  /** 다시 시도할 때 업로드부터 할지, 전송만 다시 할지 */
  failedStep?: 'upload' | 'send';
}

// 진행률이 이 시간 동안 오르지 않으면 연결이 끊긴 것으로 보고 중단한다
const STALL_TIMEOUT_MS = 60_000;

interface AttachmentUploadState {
  uploadsByChannel: Record<number, AttachmentUpload[]>;
  add: (channelId: number, files: Iterable<File>) => void;
  retry: (channelId: number, id: string) => void;
  remove: (channelId: number, ids: string[]) => void;
  update: (
    channelId: number,
    ids: string[],
    patch: Partial<AttachmentUpload>,
  ) => void;
}

// 업로드는 화면을 옮겨도 이어지도록 컴포넌트가 아니라 스토어에서 관리한다
const controllers = new Map<string, AbortController>();

function hasPendingWork(state: AttachmentUploadState) {
  return Object.values(state.uploadsByChannel).some((uploads) =>
    uploads.some(
      ({ status }) => status === 'uploading' || status === 'sending',
    ),
  );
}

let leaveGuardInstalled = false;

// 새로고침·창 닫기는 업로드를 이어갈 수 없으므로 브라우저 확인 창을 띄운다
function installLeaveGuard() {
  if (leaveGuardInstalled || typeof window === 'undefined') return;
  leaveGuardInstalled = true;

  window.addEventListener('beforeunload', (event) => {
    if (hasPendingWork(useAttachmentUploadStore.getState()))
      event.preventDefault();
  });
}

export const useAttachmentUploadStore = create<AttachmentUploadState>()((
  set,
  get,
) => {
  const start = (channelId: number, id: string, file: File) => {
    const { update } = get();
    const controller = new AbortController();
    let stalled = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    const resetWatchdog = () => {
      clearTimeout(watchdog);
      watchdog = setTimeout(() => {
        stalled = true;
        controller.abort();
      }, STALL_TIMEOUT_MS);
    };

    controllers.set(id, controller);
    resetWatchdog();

    uploadChatFile(
      channelId,
      file,
      (progress) => {
        resetWatchdog();
        update(channelId, [id], { progress });
      },
      controller.signal,
    )
      .then((confirmed) =>
        update(channelId, [id], {
          status: 'done',
          progress: 100,
          confirmed,
        }),
      )
      .catch((error: unknown) => {
        // 사용자가 지워서 멈춘 업로드는 이미 목록에 없다
        if (controller.signal.aborted && !stalled) return;

        update(channelId, [id], {
          status: 'failed',
          failedStep: 'upload',
          error: stalled
            ? '업로드가 오래 멈춰 있어 중단했어요'
            : toUploadError(error),
        });
      })
      .finally(() => {
        clearTimeout(watchdog);
        controllers.delete(id);
      });
  };

  return {
    uploadsByChannel: {},

    add: (channelId, files) => {
      installLeaveGuard();

      const added = Array.from(files, (file) => ({
        id: createUuid(),
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      set((state) => ({
        uploadsByChannel: {
          ...state.uploadsByChannel,
          [channelId]: [...(state.uploadsByChannel[channelId] ?? []), ...added],
        },
      }));

      for (const { id, file } of added) start(channelId, id, file);
    },

    retry: (channelId, id) => {
      const upload = get().uploadsByChannel[channelId]?.find(
        (item) => item.id === id,
      );
      if (upload?.status !== 'failed') return;

      // 전송만 실패했다면 이미 확인된 파일을 다시 보내면 된다
      if (upload.failedStep === 'send' && upload.confirmed) {
        get().update(channelId, [id], {
          status: 'done',
          error: undefined,
          failedStep: undefined,
        });
        return;
      }

      get().update(channelId, [id], {
        status: 'uploading',
        progress: 0,
        error: undefined,
        failedStep: undefined,
      });
      start(channelId, id, upload.file);
    },

    remove: (channelId, ids) => {
      for (const id of ids) {
        controllers.get(id)?.abort();
        controllers.delete(id);
      }

      set((state) => ({
        uploadsByChannel: {
          ...state.uploadsByChannel,
          [channelId]: (state.uploadsByChannel[channelId] ?? []).filter(
            (upload) => !ids.includes(upload.id),
          ),
        },
      }));
    },

    update: (channelId, ids, patch) =>
      set((state) => ({
        uploadsByChannel: {
          ...state.uploadsByChannel,
          [channelId]: (state.uploadsByChannel[channelId] ?? []).map(
            (upload) =>
              ids.includes(upload.id) ? { ...upload, ...patch } : upload,
          ),
        },
      })),
  };
});
