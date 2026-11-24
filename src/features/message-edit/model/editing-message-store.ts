import { create } from 'zustand';

interface EditingMessageState {
  editingRowId: string | null;
  startEditing: (rowId: string) => void;
  stopEditing: (rowId: string) => void;
}

export const useEditingMessageStore = create<EditingMessageState>()((set) => ({
  editingRowId: null,
  startEditing: (rowId) => set({ editingRowId: rowId }),
  stopEditing: (rowId) =>
    set((state) =>
      state.editingRowId === rowId ? { editingRowId: null } : state,
    ),
}));
