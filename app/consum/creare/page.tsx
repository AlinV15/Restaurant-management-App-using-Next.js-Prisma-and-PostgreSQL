// Componentă refactorizată CreareConsum cu integrare alertă cantitate insuficientă
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Save, Calendar, Package2 } from 'lucide-react';

import Sidebar from '@/app/components/Sidebar';
import LinieConsumFormModal from '@/app/components/LinieConsumFormModal';
import ConsumAlertaCantitateInsuficienta from '@/app/components/ConsumAlertaCantitateInsuficienta';
import ModalCerereAprovizionare from '@/app/components/ModalCerereAprovizionare';

import { BunLinie } from '@/lib/classes/BunLinie';
import { LinieConsumForm } from '@/lib/classes/LinieConsumForm';
import { ConsumService } from '@/lib/services/ConsumService';
import { Angajat } from '@/lib/classes/Angajat';
import { Gestiune } from '@/lib/classes/Gestiune';
import { CerereAprovizionare, StatusCerere } from '@/lib/classes/CerereAprovizionare';

const CreareConsum = () => {
    const router = useRouter();

    const [gestiuni, setGestiuni] = useState<Gestiune[]>([]);
    const [angajati, setAngajati] = useState<Angajat[]>([]);
    const [bunuri, setBunuri] = useState<BunLinie[]>([]);
    const [cereri, setCereri] = useState<CerereAprovizionare[]>([]);

    const [gestiuneSelectata, setGestiuneSelectata] = useState<number | null>(null);
    const [responsabilSelectat, setResponsabilSelectat] = useState<number | null>(null);
    const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
    const [linii, setLinii] = useState<LinieConsumForm[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [showCerere, setShowCerere] = useState(false);
    const [bunInsuficient, setBunInsuficient] = useState<BunLinie | null>(null);
    const [showCerereModal, setShowCerereModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const [g, a, b, c] = await Promise.all([
                fetch('/api/gestiune').then(r => r.json()),
                fetch('/api/angajat').then(r => r.json()),
                fetch('/api/bun').then(r => r.json()),
                fetch('/api/cerere-aprovizionare').then(r => r.json())
            ]);
            setGestiuni(g);
            setAngajati(a);
            setBunuri(b.map((bun: any) => BunLinie.fromPrisma(bun)));
            setCereri(c);
        };
        fetchData();
    }, []);

    const adaugaLinie = (linie: LinieConsumForm) => {
        setLinii([...linii, linie]);
    };

    const salveazaConsum = async () => {
        if (!gestiuneSelectata || !responsabilSelectat || linii.length === 0) {
            toast.error('Completează toate câmpurile');
            return;
        }
        const payload = ConsumService.toApiPayload(gestiuneSelectata, responsabilSelectat, data, linii);
        try {
            const res = await fetch('/api/consum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Consumul a fost salvat');
                router.push('/consum');
            } else {
                const err = await res.json();
                toast.error('Eroare: ' + err.error);
            }
        } catch (err) {
            toast.error('Eroare rețea');
        }
    };

    const getTotalValoare = () => linii.reduce((acc, l) => acc + l.valoare, 0);
    const getTotalCantitate = () => linii.reduce((acc, l) => acc + l.cantitate_eliberata, 0);

    const getCerereExistenta = () => {
        return cereri.find(
            (c) => c.id_gestiune === gestiuneSelectata && c.status === ('IN_ASTEPTARE' as StatusCerere)
        );
    };

    return (
        <div className="flex">
            <div className='w-1/5'><Sidebar /></div>
            <div className="p-8 w-4/5 space-y-8">
                <h1 className="text-3xl font-bold">Formular Consum</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <select className="p-2 border rounded" value={gestiuneSelectata ?? ''} onChange={e => setGestiuneSelectata(Number(e.target.value))}>
                        <option value="">Selectează gestiune</option>
                        {gestiuni.map(g => <option key={g.id_gestiune} value={g.id_gestiune}>{g.denumire}</option>)}
                    </select>

                    <select className="p-2 border rounded" value={responsabilSelectat ?? ''} onChange={e => setResponsabilSelectat(Number(e.target.value))}>
                        <option value="">Selectează responsabil</option>
                        {angajati.map(a => <option key={a.id_angajat} value={a.id_angajat}>{a.nume_angajat} {a.prenume_angajat}</option>)}
                    </select>

                    <div className="relative">
                        <input type="date" className="p-2 border rounded w-full" value={data} onChange={e => setData(e.target.value)} />
                        <Calendar size={18} className="absolute top-2 right-3 text-gray-400" />
                    </div>
                </div>

                <div>
                    <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Plus size={16} /> Adaugă bun
                    </button>
                </div>

                <div className="bg-white shadow rounded p-4">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Bun</th>
                                <th className="p-2 text-center">Cant. necesară</th>
                                <th className="p-2 text-center">UM</th>
                                <th className="p-2 text-center">Cant. eliberată</th>
                                <th className="p-2 text-center">Preț unitar</th>
                                <th className="p-2 text-center">Valoare</th>
                            </tr>
                        </thead>
                        <tbody>
                            {linii.map((l, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{l.nume_bun}</td>
                                    <td className="p-2 text-center">{l.cantitate_necesara}</td>
                                    <td className="p-2 text-center">{l.um}</td>
                                    <td className="p-2 text-center">{l.cantitate_eliberata}</td>
                                    <td className="p-2 text-center">{l.pret_unitar}</td>
                                    <td className="p-2 text-center">{l.valoare.toFixed(2)}</td>
                                </tr>
                            ))}
                            {linii.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-gray-500 py-6">
                                        <Package2 className="mx-auto mb-2" size={24} />
                                        Nu există bunuri adăugate încă.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {linii.length > 0 && (
                            <tfoot>
                                <tr className="bg-gray-100 font-semibold">
                                    <td className="p-2">Total</td>
                                    <td></td>
                                    <td></td>
                                    <td className="p-2 text-center">{getTotalCantitate()}</td>
                                    <td></td>
                                    <td className="p-2 text-center">{getTotalValoare().toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                <div className="flex justify-end">
                    <button onClick={salveazaConsum} className="bg-black text-white px-6 py-2 rounded flex items-center gap-2">
                        <Save size={18} /> Salvează
                    </button>
                </div>

                {showModal && (
                    <LinieConsumFormModal
                        bunuri={bunuri}
                        onSubmit={adaugaLinie}
                        onClose={() => setShowModal(false)}
                        onCantitateInsuficienta={(bun: BunLinie) => {
                            setShowModal(false);
                            setBunInsuficient(bun);
                            setShowCerere(true);
                        }}
                    />
                )}

                {showCerere && bunInsuficient && (
                    <ConsumAlertaCantitateInsuficienta
                        bun={bunInsuficient}
                        onConfirm={() => {
                            setShowCerere(false);
                            setShowCerereModal(true);
                        }}
                        onCancel={() => setShowCerere(false)}
                    />
                )}

                {showCerereModal && bunInsuficient && gestiuneSelectata && (
                    <ModalCerereAprovizionare
                        idCerere={getCerereExistenta()?.nr_document || 0}
                        isOpen={true}
                        onClose={() => setShowCerereModal(false)}
                        bunuri={bunuri}
                    />
                )}
            </div>
        </div>
    );
};

export default CreareConsum;
