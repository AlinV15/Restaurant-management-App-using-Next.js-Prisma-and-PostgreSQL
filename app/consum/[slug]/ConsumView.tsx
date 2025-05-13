'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConsumStore } from '@/app/store/consumStore';
import ConsumChart from '@/app/components/ConsumGrafic';
import { Edit, ArrowRightFromLine, ArrowLeftFromLine, ArrowLeftCircle, ArrowLeft } from 'lucide-react';

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

  const [consumuri, setConsumuri] = useState<any[]>([]);

  // Fetch all consumuri on mount
  useEffect(() => {
    async function getConsumuri() {
      try {
        const res = await fetch('http://localhost:3000/api/consum');
        const data = await res.json();
        setConsumuri(data);
      } catch (error) {
        console.error('Eroare la preluarea consumurilor:', error);
      }
    }

    getConsumuri();
  }, []);

  // Initialize store with server data
  useEffect(() => {
    setConsum(initialData.consum);
    setAngajati(initialData.angajati);
    setGestiuni(initialData.gestiuni);
    setBunuri(initialData.bunuri);
    setLiniiConsum(initialData.liniiConsum);
  }, [initialData]);

  if (!consum || consumuri.length === 0) return null;

  const thisIndex = consumuri.findIndex(c => c.id_consum === consum.id_consum);
  const prevIndex = thisIndex === 0
    ? consumuri[consumuri.length - 1].id_consum
    : consumuri[thisIndex - 1].id_consum;
  const nextIndex = thisIndex === consumuri.length - 1
    ? consumuri[0].id_consum
    : consumuri[thisIndex + 1].id_consum;

  if (!consum) return;
  if (!consum.gestiune) return;
  if (!consum.sef) return;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push('/consum')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Înapoi la lista de consumuri
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/consum/${prevIndex}?view=true`)}
            className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <ArrowLeftFromLine className="mr-2" size={20} />
            Consum anterior
          </button>

          <button
            onClick={() => router.push(`/consum/${nextIndex}?view=true`)}
            className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Consum următor
            <ArrowRightFromLine className="ml-2" size={20} />
          </button>

          <button
            onClick={() => router.push(`/consum/${consum.id_consum}?view=false`)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="mr-2" size={20} />
            Editează
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Detalii Consum #{consum.id_consum}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500 text-sm">Gestiune</p>
            <p className="font-semibold text-lg">{consum.gestiune.denumire}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Responsabil</p>
            <p className="font-semibold text-lg">
              {consum.sef.nume_angajat} {consum.sef.prenume_angajat}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Data</p>
            <p className="font-semibold text-lg">
              {new Date(consum.data).toLocaleDateString('ro-RO')}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Valoare Totală</p>
            <p className="font-bold text-lg text-blue-600">
              {new Intl.NumberFormat('ro-RO', {
                style: 'currency',
                currency: 'RON'
              }).format(Number(consum.valoare))}
            </p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Grafic Consum</h2>
          <ConsumChart liniiConsum={liniiConsum} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Linii Consum</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Bun</th>
                  <th className="px-6 py-3 text-left">Cantitate Necesară</th>
                  <th className="px-6 py-3 text-left">Cantitate Eliberată</th>
                  <th className="px-6 py-3 text-left">Valoare</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {liniiConsum.map((linie) => (
                  <tr key={linie.id_linie_consum}>
                    <td className="px-6 py-4 whitespace-nowrap">{linie.bun.nume_bun}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{Number(linie.cantitate_necesara).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{Number(linie.cant_eliberata).toFixed(2)}</td>
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
