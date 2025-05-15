'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BunLinie } from '@/lib/classes/BunLinie';
import { LinieConsumForm } from '@/lib/classes/LinieConsumForm';
import { ConsumService } from '@/lib/services/ConsumService';
import toast from 'react-hot-toast';

interface LinieConsumFormProps {
  bunuri: BunLinie[];
  onSubmit: (linie: LinieConsumForm) => void;
  onClose: () => void;
  onCantitateInsuficienta?: (bun: BunLinie, linie: LinieConsumForm) => void;
}

const LinieConsumFormModal: React.FC<LinieConsumFormProps> = ({ bunuri, onSubmit, onClose, onCantitateInsuficienta }) => {
  const [bunSelectat, setBunSelectat] = useState<number | null>(null);
  const [cantNec, setCantNec] = useState('');
  const [cantElib, setCantElib] = useState('');

  const bun = bunuri.find(b => b.id_bun === bunSelectat);

  const handleAdauga = () => {
    if (!bunSelectat || !cantNec || !cantElib) {
      toast.error('Completează toate câmpurile');
      return;
    }

    if (!bun) return;

    const linie = LinieConsumForm.fromBun(bun, cantNec, cantElib);
    const cantInsuf = ConsumService.hasCantitateInsuficienta(linie, bun.cantitate_disponibila);
    // console.log(bun.cantitate_necesara)
    bun.cantitate_necesara = Number(cantNec)

    if (cantInsuf) {
      if (onCantitateInsuficienta) {
        onCantitateInsuficienta(bun, linie);
      } else {
        toast.error(`Stoc insuficient pentru ${bun.nume_bun}`);
      }
      return;
    }

    onSubmit(linie);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold">Adaugă bun în consum</h2>

        <select
          className="w-full border rounded px-2 py-1"
          value={bunSelectat ?? ''}
          onChange={e => setBunSelectat(Number(e.target.value))}
        >
          <option value="">Selectează bun</option>
          {bunuri.map(b => (
            <option key={b.id_bun} value={b.id_bun}>
              {b.nume_bun} ({b.cantitate_disponibila} {b.unitate_masura} disponibile)
            </option>
          ))}
        </select>

        <input
          className="w-full border rounded px-2 py-1"
          type="number"
          placeholder="Cant. necesară"
          value={cantNec}
          onChange={e => setCantNec(e.target.value)}
        />
        <input
          className="w-full border rounded px-2 py-1"
          type="number"
          placeholder="Cant. eliberată"
          value={cantElib}
          onChange={e => setCantElib(e.target.value)}
        />

        <button
          onClick={handleAdauga}
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
        >
          Adaugă
        </button>
      </div>
    </div>
  );
};

export default LinieConsumFormModal;