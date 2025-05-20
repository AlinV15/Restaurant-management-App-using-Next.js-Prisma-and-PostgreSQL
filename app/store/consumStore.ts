
import { create } from "zustand";
import { Angajat } from "@/lib/classes/Angajat";
import { Gestiune } from "@/lib/classes/Gestiune";
import { Bun } from "@/lib/classes/Bun";
import { Consum } from "@/lib/classes/Consum";
import { LinieConsum } from "@/lib/classes/LinieConsum";

interface ConsumState {
  angajati: Angajat[];
  gestiuni: Gestiune[];
  bunuri: Bun[];
  liniiConsum: LinieConsum[];
  consum: Consum | null;
  consumNou: Consum | null;
  isLoading: boolean;
  isEditing: boolean;
  showDeleteConfirm: boolean;

  setAngajati: (angajati: Angajat[]) => void;
  setGestiuni: (gestiuni: Gestiune[]) => void;
  setBunuri: (bunuri: Bun[]) => void;
  setLiniiConsum: (linii: LinieConsum[]) => void;
  setConsum: (consum: Consum) => void;
  setConsumNou: (consum: Consum) => void;
  resetConsumNou: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;

  addLinieConsum: (linie: LinieConsum) => void;
  removeLinieConsum: (id_bun: number) => void;
  updateLinieConsum: (linie: LinieConsum) => void;

  updateConsum: (consumData: Consum & { linii: LinieConsum[] }) => Promise<void>;
  deleteConsum: (id: number) => Promise<void>;
}

export const useConsumStore = create<ConsumState>((set, get) => ({
  angajati: [],
  gestiuni: [],
  bunuri: [],
  liniiConsum: [],
  consum: null,
  consumNou: null,
  isLoading: true,
  isEditing: false,
  showDeleteConfirm: false,

  setAngajati: (angajati) => set({ angajati }),
  setGestiuni: (gestiuni) => set({ gestiuni }),
  setBunuri: (bunuri) => set({ bunuri }),
  setLiniiConsum: (linii) => set({ liniiConsum: linii }),
  setConsum: (consum) => set({ consum }),
  setConsumNou: (consum) => set({ consumNou: consum }),
  resetConsumNou: () => set({ consumNou: null }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsEditing: (editing) => set({ isEditing: editing }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),

  addLinieConsum: (linie) => {
    const current = get().liniiConsum;
    set({ liniiConsum: [...current, linie] });
  },
  removeLinieConsum: (id_bun) => {
    const updated = get().liniiConsum.filter(l => l.getIdBun() !== id_bun);
    set({ liniiConsum: updated });
  },
  updateLinieConsum: (linieNoua) => {
    const updated = get().liniiConsum.map(l =>
      l.getIdBun() === linieNoua.getIdBun() ? linieNoua : l
    );
    set({ liniiConsum: updated });
  },

  updateConsum: async (consumData) => {
    try {
      const response = await fetch(`/api/consum/${consumData.getId()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_sef: consumData.getIdSef(),
          id_gestiune: consumData.getIdGestiune(),
          data: consumData.getData() || new Date(),
          linii: consumData.linii,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Eroare la actualizarea consumului');
      }

      const { consum, linii } = await response.json();
      set({
        consum,
        liniiConsum: linii,
      });
    } catch (error) {
      console.error('Eroare în updateConsum:', error);
      throw error;
    }
  },

  deleteConsum: async (id) => {
    try {
      const response = await fetch(`/api/consum/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete consumption');

      set({ consum: null, liniiConsum: [] });
    } catch (error) {
      console.error('Error deleting consumption:', error);
      throw error;
    }
  },
}));
