'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConsumStore } from '@/app/store/consumStore';
import ConsumChart from '@/app/components/ConsumGrafic';
import { Edit, ArrowLeft } from 'lucide-react';

export default function ConsumView({ initialData }: { initialData: any }) {
  const router = useRouter();
  const { 
    setConsum,
    setAngajati,
    setGestiuni,
    setBunuri,
    setLiniiConsum,
    consum,
    liniiConsum
  } = useConsumStore();

  // Initialize store with server data
  useEffect(() => {
    setConsum(initialData.consum);
    setAngajati(initialData.angajati);
    setGestiuni(initialData.gestiuni);
    setBunuri(initialData.bunuri);
    setLiniiConsum(initialData.liniiConsum);
  }, [initialData]);

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
        
        <button
          onClick={() => router.push(`/consum/${consum.id_consum}?view=false`)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Edit className="mr-2" size={20} />
          Editează
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">
          Detalii Consum #{consum.id_consum}
        </h1>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Gestiune</p>
            <p className="font-medium">{consum.gestiune.denumire}</p>
          </div>
          <div>
            <p className="text-gray-600">Responsabil</p>
            <p className="font-medium">
              {consum.sef.nume_angajat} {consum.sef.prenume_angajat}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Data</p>
            <p className="font-medium">
              {new Date(consum.data).toLocaleDateString('ro-RO')}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Valoare Totală</p>
            <p className="font-medium text-blue-600">
              {new Intl.NumberFormat('ro-RO', {
                style: 'currency',
                currency: 'RON'
              }).format(Number(consum.valoare))}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Grafic Consum</h2>
          <ConsumChart liniiConsum={liniiConsum} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Linii Consum</h2>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}