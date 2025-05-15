
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowUp, ArrowDown, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Consum } from '@/lib/classes/Consum';
import { useConsumStore } from '@/app/store/consumStore';
import { formatCurrency, formatDate } from '@/app/utils/format';

interface ConsumTableProps {
  consum: Consum[];
}

const ConsumTable: React.FC<ConsumTableProps> = ({ consum }) => {
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof Consum>('nr_document');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const { angajati, gestiuni } = useConsumStore();

  const getSefName = (id: number | null) => {
    const sef = angajati.find((a) => a.id_angajat === id);
    return sef ? `${sef.prenume_angajat} ${sef.nume_angajat}` : '—';
  };

  const getGestiuneName = (id: number) => {
    return gestiuni.find((g) => g.id_gestiune === id)?.denumire || '—';
  };

  const toggleSort = (field: keyof Consum) => {
    setSortField(field);
    setSortDirection(prev => (sortField === field && prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedConsum = [...consum].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA instanceof Date && valB instanceof Date) {
      return sortDirection === 'asc'
        ? valA.getTime() - valB.getTime()
        : valB.getTime() - valA.getTime();
    }
    return sortDirection === 'asc'
      ? Number(valA) - Number(valB)
      : Number(valB) - Number(valA);
  });

  // console.log(sortedConsum[0])

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-zinc-800">Lista bonurilor de consum</h2>
        <Link href="/consum/creare">
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-zinc-800 flex items-center gap-2">
            <Plus size={16} /> Adaugă consum
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-zinc-800 border-collapse">
          <thead>
            <tr className="bg-zinc-100 text-left">
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('nr_document')}>
                Nr.
                {sortField === 'nr_document' && (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </th>
              <th className="p-3">Gestiune</th>
              <th className="p-3">Șef</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('data')}>
                Dată
                {sortField === 'data' && (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('valoare')}>
                Valoare
                {sortField === 'valoare' && (sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </th>
              <th className="p-3">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {sortedConsum.map((c) => (
              <tr key={c.nr_document} className="border-b hover:bg-zinc-50">
                <td className="p-3">{c.nr_document}</td>
                <td className="p-3">{getGestiuneName(c.id_gestiune)}</td>
                <td className="p-3">{getSefName(c.id_sef)}</td>
                <td className="p-3">{formatDate(c.data)}</td>
                <td className="p-3">{formatCurrency(c.valoare)}</td>
                <td className="p-3 relative">
                  <button onClick={() => setActiveDropdown(c.nr_document === activeDropdown ? null : c.nr_document)}>
                    <MoreHorizontal size={18} />
                  </button>
                  {activeDropdown === c.nr_document && (
                    <div className="absolute right-0 top-full mt-2 bg-white border rounded-md shadow-md z-10 w-36 text-sm">
                      <button className="w-full px-4 py-2 hover:bg-gray-100 flex gap-2 items-center" onClick={() => router.push('/consum/view/' + c.nr_document)}>
                        <Eye size={14} /> Vizualizează
                      </button>
                      <button className="w-full px-4 py-2 hover:bg-gray-100 flex gap-2 items-center" onClick={() => router.push('/consum/edit/' + c.nr_document)}>
                        <Edit size={14} /> Editează
                      </button>
                      <button className="w-full px-4 py-2 text-red-500 hover:bg-gray-100 flex gap-2 items-center">
                        <Trash2 size={14} /> Șterge
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {sortedConsum.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-400">
                  Nu există consumuri înregistrate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsumTable;
