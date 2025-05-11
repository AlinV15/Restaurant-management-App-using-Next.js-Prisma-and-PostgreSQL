'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConsumStore } from '@/app/store/consumStore';
import { Save, ArrowLeft, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConsumEdit({ initialData }: { initialData: any }) {
  const router = useRouter();
  const {
    setConsum,
    setAngajati,
    setGestiuni,
    setBunuri,
    setLiniiConsum,
    updateConsum,
    deleteConsum,
    consum,
    angajati,
    gestiuni,
    liniiConsum
  } = useConsumStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize store with server data
  useEffect(() => {
    setConsum(initialData.consum);
    setAngajati(initialData.angajati);
    setGestiuni(initialData.gestiuni);
    setBunuri(initialData.bunuri);
    setLiniiConsum(initialData.liniiConsum);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateConsum(consum);
      toast.success('Consumul a fost actualizat cu succes!');
      router.push('/consum');
    } catch (error) {
      toast.error('A apărut o eroare la actualizarea consumului.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!consum) return;

    try {
      await deleteConsum(consum.id_consum);
      toast.success('Consumul a fost șters cu succes!');
      router.push('/consum');
    } catch (error) {
      toast.error('A apărut o eroare la ștergerea consumului.');
    }
  };

  if (!consum) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/consum')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2" size={20} />
          Înapoi la lista de consumuri
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            disabled={isSubmitting}
          >
            <Trash2 className="mr-2" size={20} />
            Șterge
          </button>
          
          <button
            onClick={handleSubmit}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={isSubmitting}
          >
            <Save className="mr-2" size={20} />
            {isSubmitting ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">
          Editare Consum #{consum.id_consum}
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gestiune
            </label>
            <select
              value={consum.id_gestiune}
              onChange={(e) => setConsum({ ...consum, id_gestiune: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              {gestiuni.map((g) => (
                <option key={g.id_gestiune} value={g.id_gestiune}>
                  {g.denumire}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsabil
            </label>
            <select
              value={consum.id_sef}
              onChange={(e) => setConsum({ ...consum, id_sef: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              {angajati.map((a) => (
                <option key={a.id_angajat} value={a.id_angajat}>
                  {a.nume_angajat} {a.prenume_angajat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Linii Consum</h2>
            <button
              type="button"
              onClick={() => router.push(`/consum/${consum.id_consum}/adauga-linie`)}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus className="mr-2" size={20} />
              Adaugă linie
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bun
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantitate Necesară
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantitate Eliberată
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valoare
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {liniiConsum.map((linie) => (
                  <tr key={linie.id_linie_consum}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {linie.bun.nume_bun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Number(linie.cantitate_necesara).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Number(linie.cant_eliberata).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Intl.NumberFormat('ro-RO', {
                        style: 'currency',
                        currency: 'RON'
                      }).format(Number(linie.valoare))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => router.push(`/consum/${consum.id_consum}/linie/${linie.id_linie_consum}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editează
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Confirmare ștergere</h3>
            <p className="mb-4">Sigur doriți să ștergeți acest consum?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Anulează
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}