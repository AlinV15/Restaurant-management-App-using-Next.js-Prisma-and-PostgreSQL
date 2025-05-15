
import { create } from "zustand";
import { Bun } from "@/lib/classes/Bun";
import { LinieConsum } from "@/lib/classes/LinieConsum";
import { Gestiune } from "@/lib/classes/Gestiune";
import { Angajat } from "@/lib/classes/Angajat";
import { Consum } from "@/lib/classes/Consum";

interface ConsumState {
  angajati: Angajat[];
  gestiuni: Gestiune[];
  bunuri: Bun[];
  liniiConsum: LinieConsum[];
  consum: Consum | null;
  isLoading: boolean;
  isEditing: boolean;
  showDeleteConfirm: boolean;

  setAngajati: (angajati: Angajat[]) => void;
  setGestiuni: (gestiuni: Gestiune[]) => void;
  setBunuri: (bunuri: Bun[]) => void;
  setLiniiConsum: (linii: LinieConsum[]) => void;
  setConsum: (consum: Consum) => void;
  setIsLoading: (loading: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;

  getSefName: (id: number | null) => string;
  getGestiuneName: (id: number) => string;
  getBunById: (id: number) => Bun;
  getBunName: (id: number) => string;
  getBunUM: (id: number) => string;

  updateConsum: (consumData: Consum & { linii: LinieConsum[] }) => Promise<void>;
  deleteConsum: (id: number) => Promise<void>;
}

export const useConsumStore = create<ConsumState>((set, get) => ({
  angajati: [],
  gestiuni: [],
  bunuri: [],
  liniiConsum: [],
  consum: null,
  isLoading: true,
  isEditing: false,
  showDeleteConfirm: false,

  setAngajati: (angajati) => set({ angajati }),
  setGestiuni: (gestiuni) => set({ gestiuni }),
  setBunuri: (bunuri) => set({ bunuri }),
  setLiniiConsum: (linii) => set({ liniiConsum: linii }),
  setConsum: (consum) => set({ consum }),

  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsEditing: (editing) => set({ isEditing: editing }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),

  getSefName: (id) => {
    const sef = get().angajati.find((a) => a.id_angajat === id);
    return sef ? `${sef.prenume_angajat} ${sef.nume_angajat}` : '—';
  },

  getGestiuneName: (id) => {
    return get().gestiuni.find((g) => g.id_gestiune === id)?.denumire || '—';
  },

  getBunById: (id) => {
    return get().bunuri.find(b => b.id_bun === id) ?? Bun.placeholder(id);
  },

  getBunName: (id) => {
    return get().bunuri.find(b => b.id_bun === id)?.nume_bun ?? 'Necunoscut';
  },

  getBunUM: (id) => {
    return get().bunuri.find(b => b.id_bun === id)?.unitate_masura ?? '';
  },

  updateConsum: async (consumData) => {
    try {
      const response = await fetch(`/api/consum/${consumData.nr_document}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_sef: consumData.id_sef,
          id_gestiune: consumData.id_gestiune,
          data: consumData.data,
          linii: consumData.linii.map(l => l.toJson())
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Eroare la actualizarea consumului');
      }

      const { consum, linii } = await response.json();
      set({
        consum: Consum.fromApi(consum),
        liniiConsum: linii.map(LinieConsum.fromApi),
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
