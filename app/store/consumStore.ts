import { create } from 'zustand';
import { Angajat, Gestiune, Bun, LinieConsum } from '@prisma/client';

interface ConsumState {
  // Data
  angajati: Angajat[];
  gestiuni: Gestiune[];
  bunuri: Bun[];
  liniiConsum: LinieConsum[];
  consum: any | null;
  
  // UI states
  isLoading: boolean;
  isEditing: boolean;
  showDeleteConfirm: boolean;
  
  // Actions
  setAngajati: (angajati: Angajat[]) => void;
  setGestiuni: (gestiuni: Gestiune[]) => void;
  setBunuri: (bunuri: Bun[]) => void;
  setLiniiConsum: (linii: LinieConsum[]) => void;
  setConsum: (consum: any) => void;
  setIsLoading: (loading: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  
  // Business logic
  updateConsum: (consumData: any) => Promise<void>;
  deleteConsum: (id: number) => Promise<void>;
  addLinieConsum: (linie: LinieConsum) => Promise<void>;
  updateLinieConsum: (id: number, linie: Partial<LinieConsum>) => Promise<void>;
  deleteLinieConsum: (id: number) => Promise<void>;
}

export const useConsumStore = create<ConsumState>((set, get) => ({
  // Initial state
  angajati: [],
  gestiuni: [],
  bunuri: [],
  liniiConsum: [],
  consum: null,
  isLoading: true,
  isEditing: false,
  showDeleteConfirm: false,

  // Setters
  setAngajati: (angajati) => set({ angajati }),
  setGestiuni: (gestiuni) => set({ gestiuni }),
  setBunuri: (bunuri) => set({ bunuri }),
  setLiniiConsum: (linii) => set({ liniiConsum: linii }),
  setConsum: (consum) => set({ consum }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsEditing: (editing) => set({ isEditing: editing }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),

  // Business logic
  updateConsum: async (consumData) => {
    try {
      const response = await fetch(`/api/consum/${consumData.id_consum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consumData),
      });
      
      if (!response.ok) throw new Error('Failed to update consumption');
      
      const updatedConsum = await response.json();
      set({ consum: updatedConsum });
    } catch (error) {
      console.error('Error updating consumption:', error);
      throw error;
    }
  },

  deleteConsum: async (id) => {
    try {
      const response = await fetch(`/api/consum/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete consumption');
      
      set({ consum: null });
    } catch (error) {
      console.error('Error deleting consumption:', error);
      throw error;
    }
  },

  addLinieConsum: async (linie) => {
    try {
      const response = await fetch('/api/linie-consum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linie),
      });
      
      if (!response.ok) throw new Error('Failed to add consumption line');
      
      const newLinie = await response.json();
      set(state => ({
        liniiConsum: [...state.liniiConsum, newLinie]
      }));
    } catch (error) {
      console.error('Error adding consumption line:', error);
      throw error;
    }
  },

  updateLinieConsum: async (id, linie) => {
    try {
      const response = await fetch(`/api/linie-consum/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linie),
      });
      
      if (!response.ok) throw new Error('Failed to update consumption line');
      
      const updatedLinie = await response.json();
      set(state => ({
        liniiConsum: state.liniiConsum.map(l => 
          l.id_linie_consum === id ? updatedLinie : l
        )
      }));
    } catch (error) {
      console.error('Error updating consumption line:', error);
      throw error;
    }
  },

  deleteLinieConsum: async (id) => {
    try {
      const response = await fetch(`/api/linie-consum/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete consumption line');
      
      set(state => ({
        liniiConsum: state.liniiConsum.filter(l => l.id_linie_consum !== id)
      }));
    } catch (error) {
      console.error('Error deleting consumption line:', error);
      throw error;
    }
  },
}));