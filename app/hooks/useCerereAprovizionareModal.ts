import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LinieCerereAprovizionare } from '@/lib/classes/LinieCerereAprovizionare';
import { useLinieCerereAprovizionare } from '@/app/hooks/useLinieCerereAprovizionare';

export function useCerereAprovizionareModal(idCerere?: number) {
  const [linii, setLinii] = useState<LinieCerereAprovizionare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLinie, setEditingLinie] = useState<LinieCerereAprovizionare | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const { createLinie, updateLinie: updateLinieInDB, deleteLinie } = useLinieCerereAprovizionare();

  useEffect(() => {
    if (idCerere) fetchLiniiCerere(idCerere);
  }, [idCerere]);

  const fetchLiniiCerere = async (id: number) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/cerere-aprovizionare?${id}`);
      if (!res.ok) throw new Error("Eroare la încărcare");

      const data = await res.json();
      const liniiProcesate = data.map((linie: any) => LinieCerereAprovizionare.fromPrisma(linie));
      setLinii(liniiProcesate);
    } catch (err) {
      toast.error("Eroare la încărcarea datelor");
    } finally {
      setIsLoading(false);
    }
  };

  const addLinie = async (data: any) => {
    try {
      const linie = await createLinie(data);
      setLinii([...linii, linie]);
    } catch (_) { }
  };

  const updateLinie = async (data: any) => {
    if (!editingLinie) return;

    try {
      const linie = await updateLinieInDB(editingLinie.id, data);
      setLinii(linii.map(l => (l.id === editingLinie.id ? linie : l)));
      setEditingLinie(null);
    } catch (_) { }
  };

  const removeLinie = async (linie: LinieCerereAprovizionare) => {
    try {
      await deleteLinie(linie.id);
      setLinii(linii.filter(l => l.id !== linie.id));
    } catch (_) { }
  };

  const getValoareTotala = () => {
    return linii.reduce((total, linie) => total + linie.valoare, 0);
  };

  return {
    linii,
    setLinii,
    isLoading,
    editingLinie,
    setEditingLinie,
    actionInProgress,
    setActionInProgress,
    fetchLiniiCerere,
    addLinie,
    updateLinie,
    removeLinie,
    getValoareTotala,
  };
}
