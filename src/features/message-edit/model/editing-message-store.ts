import { create } from 'zustand';

interface EditingMessageState {
  editingMessageId: string | null;
  startEditing: (messageId: string) => void;
  stopEditing: (messageId: string) => void;
}

export const useEditingMessageStore = create<EditingMessageState>()((set) => ({
  editingMessageId: null,
  startEditing: (messageId) => set({ editingMessageId: messageId }),
  stopEditing: (messageId) =>
    set((state) =>
      state.editingMessageId === messageId ? { editingMessageId: null } : state,
    ),
}));
