
import React from 'react';
import { Bun } from '@/lib/classes/Bun';

interface ProductDropdownProps {
  bunuri: Bun[];
  selectedId: number | null;
  onChange: (bun: Bun | null) => void;
}

const ProductDropdown: React.FC<ProductDropdownProps> = ({ bunuri, selectedId, onChange }) => {
  return (
    <select
      value={selectedId || ''}
      onChange={(e) => {
        const id = parseInt(e.target.value);
        const selected = bunuri.find(b => b.id_bun === id) || null;
        onChange(selected);
      }}
      className="w-full border border-gray-300 rounded px-3 py-2"
    >
      <option value="">Selectează un bun</option>
      {bunuri.map((bun) => (
        <option key={bun.id_bun} value={bun.id_bun}>
          {bun.nume_bun} - {bun.pret_unitar} RON / {bun.unitate_masura}
        </option>
      ))}
    </select>
  );
};

export default ProductDropdown;
