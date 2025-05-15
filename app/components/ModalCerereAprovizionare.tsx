// ModalCerereAprovizionare.tsx
'use client';

import React from 'react';
import { X, Edit, Trash2, Loader2, Plus } from 'lucide-react';
import { useCerereAprovizionareModal } from '@/app/hooks/useCerereAprovizionareModal';
import { LinieCerereAprovizionare } from '@/lib/classes/LinieCerereAprovizionare';
import ModalAdaugareBun from './ModalLinieCerere';
import { Bun } from '@/lib/classes/Bun';

interface Props {
    idCerere: number;
    isOpen: boolean;
    onClose: () => void;
    bunuri: Bun[];
}

export default function ModalCerereAprovizionare({ idCerere, isOpen, onClose, bunuri }: Props) {
    const {
        linii,
        isLoading,
        editingLinie,
        setEditingLinie,
        addLinie,
        updateLinie,
        removeLinie,
        getValoareTotala
    } = useCerereAprovizionareModal(idCerere);

    const [modalAdaugareOpen, setModalAdaugareOpen] = React.useState(false);

    const handleAddClick = () => {
        setEditingLinie(null);
        setModalAdaugareOpen(true);
    };
    console.log(idCerere)

    const handleEditClick = (linie: LinieCerereAprovizionare) => {
        setEditingLinie(linie);
        setModalAdaugareOpen(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold mb-4">Linii cerere aprovizionare</h2>

                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                    </div>
                ) : linii.length === 0 ? (
                    <p className="text-center text-gray-400 italic py-8">Nicio linie adăugată.</p>
                ) : (
                    <div className="space-y-3">
                        {linii.map((linie) => (
                            <div key={linie.id} className="border rounded-lg p-4 flex justify-between items-start hover:bg-gray-50">
                                <div>
                                    <p className="font-medium">ID Bun: {linie.id_bun}</p>
                                    <p className="text-sm text-gray-700">
                                        Cantitate: {linie.cantitate} | Valoare: {linie.valoare.toFixed(2)} RON
                                    </p>
                                    {linie.observatii && (
                                        <p className="text-xs italic text-gray-500 mt-1">"{linie.observatii}"</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditClick(linie)} className="p-2 hover:bg-gray-200 rounded">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeLinie(linie)} className="p-2 hover:bg-red-100 text-red-600 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between items-center mt-6 border-t pt-4">
                    <span className="font-medium text-sm">
                        Total: <span className="text-blue-600">{getValoareTotala().toFixed(2)} RON</span>
                    </span>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                    >
                        <Plus className="w-4 h-4" />
                        Adaugă linie
                    </button>
                </div>
            </div>

            {modalAdaugareOpen && (
                <ModalAdaugareBun
                    bunuri={bunuri}
                    isOpen={modalAdaugareOpen}
                    onClose={() => setModalAdaugareOpen(false)}
                    onSave={(linie) => {
                        editingLinie ? updateLinie(linie) : addLinie(linie);
                        setModalAdaugareOpen(false);
                    }}
                    existingLine={editingLinie || undefined}
                    idCerere={idCerere}
                />
            )}
        </div>
    );
}
