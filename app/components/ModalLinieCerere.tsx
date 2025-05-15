
'use client';

import React from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bun } from '@/lib/classes/Bun';
import { LinieCerereAprovizionare } from '@/lib/classes/LinieCerereAprovizionare';
import ProductDropdown from '@/app/components/ProductDropdown';
import AnimatedField from '@/app/components/AnimatedField';

interface ModalLinieCerereProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linie: LinieCerereAprovizionare) => void;
  bunuri: Bun[];
  idCerere: number;
  existingLine?: LinieCerereAprovizionare;
}

const ModalLinieCerere: React.FC<ModalLinieCerereProps> = ({
  isOpen,
  onClose,
  onSave,
  bunuri,
  idCerere,
  existingLine
}) => {
  const [selectedBun, setSelectedBun] = React.useState<Bun | null>(() => {
    if (existingLine) {
      return bunuri.find(b => b.id_bun === existingLine.id_bun) || null;
    }
    return null;
  });

  const [cantitate, setCantitate] = React.useState<number>(existingLine?.cantitate || 1);

  const valoare = selectedBun ? Number(selectedBun.pret_unitar) * cantitate : 0;

  const handleSave = () => {
    if (!selectedBun || cantitate <= 0) {
      toast.error("Selectează un bun și o cantitate validă");
      return;
    }

    const linie = new LinieCerereAprovizionare(
      existingLine?.id ?? 0,
      idCerere,
      selectedBun.id_bun,
      cantitate,
      valoare,
      existingLine?.observatii ?? ''
    );
    console.log(linie)

    onSave(linie);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black transition"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {existingLine ? 'Editează linia de cerere' : 'Adaugă linie de cerere'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bun</label>
            <ProductDropdown
              bunuri={bunuri}
              selectedId={selectedBun?.id_bun || null}
              onChange={setSelectedBun}
            />
          </div>

          <AnimatedField
            id="cantitate"
            label="Cantitate necesară"
            type="number"
            value={cantitate}
            min={0}
            onChange={(e) => setCantitate(parseFloat(e.target.value))}
          />

          <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 border border-gray-200">
            Valoare estimată: <strong>{valoare.toFixed(2)} RON</strong>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Anulează
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            Salvează
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLinieCerere;
