import { create } from 'zustand';

interface EditingMessageState {
  editingKey: string | null;
  startEditing: (key: string) => void;
  stopEditing: (key: string) => void;
}

/**
 * 같은 메시지가 목록과 스레드·고정 패널에 함께 보일 수 있으므로, 수정 중인 것은
 * 메시지 id가 아니라 `화면 id`와 `메시지 id`를 묶은 키로 구분한다.
 */
export function editingKeyOf(surfaceId: string, messageId: string): string {
  return `${surfaceId}|${messageId}`;
}

export const useEditingMessageStore = create<EditingMessageState>()((set) => ({
  editingKey: null,
  startEditing: (key) => set({ editingKey: key }),
  stopEditing: (key) =>
    set((state) => (state.editingKey === key ? { editingKey: null } : state)),
}));
