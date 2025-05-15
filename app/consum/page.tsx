'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import ConsumChart from '../components/ConsumGrafic';
import ConsumTable from '../components/ConsumTable';
import ReportDialog from '../components/ReportDialog';
import LoadingSpinner from '../components/LoadingSpinner';

import { Bun } from '@/lib/classes/Bun';
import { Gestiune } from '@/lib/classes/Gestiune';
import { Angajat } from '@/lib/classes/Angajat';
import { Consum } from '@/lib/classes/Consum';
import { LinieConsum } from '@/lib/classes/LinieConsum';
import { LinieConsumExtinsa } from '@/lib/classes/LinieConsumExtinsa';

import { useConsumStore } from '../store/consumStore';

const Page = () => {
  const {
    angajati,
    gestiuni,
    setAngajati,
    setGestiuni,
    setBunuri,
    setLiniiConsum,
    bunuri,
    liniiConsum,
    getSefName,
    getGestiuneName,
    getBunById
  } = useConsumStore();

  const [consumuri, setConsumuri] = useState<Consum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [liniiRes, bunuriRes, consumuriRes, angajatiRes, gestiuniRes] = await Promise.all([
        fetch('/api/linie-consum'),
        fetch('/api/bun'),
        fetch('/api/consum'),
        fetch('/api/angajat'),
        fetch('/api/gestiune')
      ]);

      if (!liniiRes.ok || !bunuriRes.ok || !consumuriRes.ok || !angajatiRes.ok || !gestiuniRes.ok) {
        throw new Error('Eroare la preluarea datelor');
      }

      setLiniiConsum((await liniiRes.json()).map(LinieConsum.fromApi));
      setBunuri((await bunuriRes.json()).map(Bun.fromPrisma));
      setConsumuri((await consumuriRes.json()).map(Consum.fromPrisma));
      setAngajati((await angajatiRes.json()).map(Angajat.fromPrisma));
      setGestiuni((await gestiuniRes.json()).map(Gestiune.fromPrisma));
    } catch (error) {
      console.error('Eroare:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processedConsumuri = useMemo(() => {
    return consumuri.map(consum => new Consum(
      consum.nr_document,
      new Date(consum.data),
      consum.valoare,
      consum.id_sef,
      consum.id_gestiune
    ));
  }, [consumuri]);

  //console.log(processedConsumuri)
  /// console.log(liniiConsum)

  const processedLiniiConsum = liniiConsum.map(linie => {
    let bun;

    console.log(bunuri)
    for (let bunu of bunuri) {
      if (bunu.id_bun === linie.id_bun) {
        bun = bunu
      }
    }
    console.log(bun)
    if (!bun) return;


    return new LinieConsumExtinsa(
      linie.id_linie_consum,
      linie.id_consum,
      linie.id_bun,
      Number(linie.cantitate_necesara),
      Number(linie.cant_eliberata),
      Number(linie.valoare),
      new Bun(bun.id_bun, bun.nume_bun, Number(bun.cantitate_disponibila), Number(bun.pret_unitar), bun.unitate_masura, bun.data_expirare!)
    );
  });

  console.log(processedLiniiConsum)

  if (loading) {
    return (
      <div className="bg-white flex">
        <Sidebar />
        <div className="w-4/5 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white flex">
        <Sidebar />
        <div className="w-4/5 flex items-center justify-center flex-col">
          <p className="text-xl text-red-600">A apărut o eroare la încărcarea datelor.</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reîncarcă
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex">
      <div className="w-1/4">
        <Sidebar />
      </div>
      <div className="w-4/5 flex flex-col p-6 text-black space-y-6">
        <h1 className="text-2xl font-bold">Gestionare Consum</h1>
        <div className="border-t border-gray-300"></div>

        <section>
          <h2 className="text-xl font-semibold mb-2">Analiză Consum</h2>
          {processedLiniiConsum.length > 0 ? (
            <ConsumChart liniiConsum={processedLiniiConsum} />
          ) : (
            <p className="text-gray-600">Nu există date pentru graficul de consum.</p>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lista Consumuri</h2>
            <button
              onClick={() => setIsReportDialogOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generează Raport
            </button>
          </div>

          {processedConsumuri.length > 0 ? (
            <ConsumTable consum={processedConsumuri} />
          ) : (
            <p className="text-gray-600">Nu există consumuri disponibile.</p>
          )}
        </section>

        {isReportDialogOpen && (
          <ReportDialog
            isOpen={isReportDialogOpen}
            onClose={() => setIsReportDialogOpen(false)}
            gestiuni={gestiuni}
            bunuri={bunuri}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
