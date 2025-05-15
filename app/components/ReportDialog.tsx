
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bun } from '@/lib/classes/Bun';
import { Gestiune } from '@/lib/classes/Gestiune';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gestiuni: Gestiune[];
  bunuri: Bun[];
}

const ReportDialog: React.FC<ReportDialogProps> = ({ isOpen, onClose, gestiuni, bunuri }) => {
  const router = useRouter();
  const [selectedGestiuni, setSelectedGestiuni] = useState<number[]>([]);
  const [selectedBunuri, setSelectedBunuri] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectAllGestiuni, setSelectAllGestiuni] = useState<boolean>(false);
  const [selectAllBunuri, setSelectAllBunuri] = useState<boolean>(false);

  const handleToggleAllGestiuni = () => {
    setSelectAllGestiuni(!selectAllGestiuni);
    setSelectedGestiuni(!selectAllGestiuni ? gestiuni.map(g => g.id_gestiune) : []);
  };

  const handleToggleAllBunuri = () => {
    setSelectAllBunuri(!selectAllBunuri);
    setSelectedBunuri(!selectAllBunuri ? bunuri.map(b => b.id_bun) : []);
  };

  const generateReport = () => {
    const params = new URLSearchParams();

    if (startDate) params.append('dataStart', startDate);
    if (endDate) params.append('dataEnd', endDate);
    if (selectedGestiuni.length > 0 && !selectAllGestiuni) {
      params.append('gestiuni', selectedGestiuni.join(','));
    }
    if (selectedBunuri.length > 0 && !selectAllBunuri) {
      params.append('bunuri', selectedBunuri.join(','));
    }

    router.push(`/consum/raport?${params.toString()}`);
  };

  const resetForm = () => {
    setSelectedGestiuni([]);
    setSelectedBunuri([]);
    setStartDate('');
    setEndDate('');
    setSelectAllGestiuni(false);
    setSelectAllBunuri(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Date despre raport</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="allGestiuni"
                  className="mr-2"
                  checked={selectAllGestiuni}
                  onChange={handleToggleAllGestiuni}
                />
                <label htmlFor="allGestiuni" className="text-gray-700">Toate gestiunile</label>
              </div>
              <select
                className="w-full border border-gray-300 rounded p-2"
                multiple
                value={selectedGestiuni.map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                  setSelectedGestiuni(values);
                }}
                disabled={selectAllGestiuni}
                size={5}
              >
                {gestiuni.map(g => (
                  <option key={g.id_gestiune} value={g.id_gestiune}>
                    {g.denumire || `Gestiune #${g.id_gestiune}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="allBunuri"
                  className="mr-2"
                  checked={selectAllBunuri}
                  onChange={handleToggleAllBunuri}
                />
                <label htmlFor="allBunuri" className="text-gray-700">Toate bunurile</label>
              </div>
              <select
                className="w-full border border-gray-300 rounded p-2"
                multiple
                value={selectedBunuri.map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                  setSelectedBunuri(values);
                }}
                disabled={selectAllBunuri}
                size={5}
              >
                {bunuri.map(b => (
                  <option key={b.id_bun} value={b.id_bun}>
                    {b.nume_bun} ({b.unitate_masura}) - {b.pret_unitar.toFixed(2)} RON
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium mb-4">Perioada de raportare</h4>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <span className="mr-2">de la</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded p-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <span className="mr-2">până la</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded p-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
              onClick={resetForm}
            >
              Renunță
            </button>
            <button
              className="bg-black hover:bg-gray-800 text-white px-8 py-2 rounded"
              onClick={generateReport}
              disabled={!startDate && !endDate}
            >
              Generează raport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDialog;
