
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, Edit, Trash2, Calendar, Plus, Save, Loader2, FileCheck, ShieldAlert, ShoppingCart, Package2
} from 'lucide-react';
import ConsumAlertaCantitateInsuficienta from '@/app/components/ConsumAlertaCantitateInsuficienta';
import ModalCerereAprovizionare from '@/app/components/ModalCerereAprovizionare';
import { BunCerere, useCreareConsum } from '@/app/hooks/useCreareConsum';
import toast from 'react-hot-toast';


const CreareConsum = () => {
  const router = useRouter();
  const {
    angajati,
    gestiuni,
    bunuri,
    liniiConsum,
    gestiuneSelectata,
    setGestiuneSelectata,
    responsabilSelectat,
    setResponsabilSelectat,
    dataConsum,
    setDataConsum,
    modalVisible,
    setModalVisible,
    bunSelectat,
    setBunSelectat,
    cantitateNecesara,
    setCantitateNecesara,
    cantitateEliberata,
    setCantitateEliberata,
    valoareCalculata,
    adaugaBun,
    inchideModal,
    showAlertaInsuficienta,
    setShowAlertaInsuficienta,
    bunCuCantitateInsuficienta,
    setBunCuCantitateInsuficienta,
    showCerereAprovizionare,
    setShowCerereAprovizionare,
    cerereExistenta,
    isLoading,
    isSaving,
    setIsSaving,
    formDirty,
    setFormDirty,
    editLinie,
    stergeLinie,
    handleCancelAlertaInsuficienta,
    handleSaveCerereAprovizionare,
    handleConfirmAlertaInsuficienta,
    deschideModal,
    linie,
    formatNumber,
    getValoareTotala,
    getCantitateaTotala,
    salveazaConsum,
    renunta,
  } = useCreareConsum();

  // State pentru interactivitate

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);


  return (
    <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-black text-white p-5">
          <h1 className="text-3xl font-serif text-center flex items-center justify-center gap-3">
            <ShieldAlert className="h-7 w-7 text-red-500" />
            Formular consum
          </h1>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="animate-spin w-10 h-10 mx-auto mb-2 text-gray-600" />
            Se încarcă datele...
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-4 items-center">
              <label className="text-right font-serif text-lg">Gestiune:</label>
              <select
                className="col-span-3 p-2 border rounded"
                value={gestiuneSelectata || ''}
                onChange={(e) => setGestiuneSelectata(Number(e.target.value) || null)}
              >
                <option value="">Selectează gestiunea</option>
                {gestiuni.map(g => (
                  <option key={g.getIdGestiune()} value={g.getIdGestiune()}>
                    {g.getDenumire()}
                  </option>
                ))}
              </select>

              <label className="text-right font-serif text-lg">Responsabil:</label>
              <select
                className="col-span-3 p-2 border rounded"
                value={responsabilSelectat || ''}
                onChange={(e) => setResponsabilSelectat(Number(e.target.value) || null)}
              >
                <option value="">Selectează responsabilul</option>
                {angajati.map(a => (
                  <option key={a.getId()} value={a.getId()}>
                    {a.getNumeComplet()}
                  </option>
                ))}
              </select>

              <label className="text-right font-serif text-lg">Data:</label>
              <input
                type="date"
                className="col-span-3 p-2 border rounded"
                value={dataConsum}
                onChange={(e) => setDataConsum(e.target.value)}
              />
            </div>

            {/* Cerere de aprovizionare existentă - dacă există */}
            {cerereExistenta && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-full text-white flex-shrink-0">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-blue-700">Cerere de aprovizionare în așteptare</h3>
                  <p className="text-sm text-blue-600">
                    Există o cerere de aprovizionare în așteptare pentru această gestiune (ID: {cerereExistenta.getId()}).
                    Noile produse ce necesită aprovizionare vor fi adăugate la această cerere.
                  </p>
                </div>
              </div>
            )}

            {/* Secțiunea de bunuri utilizate */}
            <div className="mb-4">
              <h2 className="text-2xl font-serif mb-4">Bunuri utilizate</h2>

              <div className="flex justify-end mb-3">
                <button
                  onClick={deschideModal}
                  className="bg-white text-black border border-black hover:bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 transition-all shadow hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={18} />
                  Adaugă bun de pe stoc
                </button>
              </div>

              <div className="bg-red-600 rounded-lg p-4 shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-md overflow-hidden">
                    <thead>
                      <tr className="bg-gray-800 text-white">
                        <th className="p-3 text-left">Denumire bun</th>
                        <th className="p-3 text-center">Cant. necesară</th>
                        <th className="p-3 text-center">UM</th>
                        <th className="p-3 text-center">Cant. eliberată</th>
                        <th className="p-3 text-center">Preț unitar</th>
                        <th className="p-3 text-center">Valoare</th>
                        <th className="p-3 text-center">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liniiConsum.map((linie, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          onMouseEnter={() => setHoveredRow(index)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td className="p-3 border-r">{linie.getBun()?.getNume()}</td>
                          <td className="p-3 border-r text-center">{formatNumber(linie.getCantitateNecesara())}</td>
                          <td className="p-3 border-r text-center">{linie.getBun()?.getUM()}</td>
                          <td className="p-3 border-r text-center">{formatNumber(linie.getCantitateEliberata())}</td>
                          <td className="p-3 border-r text-center">{formatNumber(linie.getBun()?.getPretUnitar())}</td>
                          <td className="p-3 border-r text-center font-medium">{formatNumber(linie.getValoare())}</td>
                          <td className="p-3 flex justify-center gap-2">
                            <button
                              onClick={() => editLinie(index)}
                              className="bg-cyan-500 p-1.5 rounded-full text-white hover:bg-cyan-600 transition-colors shadow"
                              title="Editează"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => stergeLinie(index)}
                              className="bg-red-500 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors shadow"
                              title="Șterge"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {liniiConsum.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-gray-500">
                            <Package2 className="mx-auto mb-2" size={24} />
                            <p>Nu există bunuri adăugate.</p>
                            <p className="text-sm mt-1">Folosiți butonul "Adaugă bun de pe stoc" pentru a adăuga produse.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {liniiConsum.length > 0 && (
                      <tfoot>
                        <tr className="bg-gray-100 border-t border-gray-300 font-medium">
                          <td className="p-3">Total</td>
                          <td className="p-3"></td>
                          <td className="p-3"></td>
                          <td className="p-3 text-center">{formatNumber(getCantitateaTotala())}</td>
                          <td className="p-3"></td>
                          <td className="p-3 text-center font-bold">{formatNumber(getValoareTotala())}</td>
                          <td className="p-3"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>

            {/* Butoanele de acțiune */}
            <div className="flex justify-between mt-8">
              <button
                onClick={renunta}
                className="bg-red-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors shadow hover:shadow-md"
                disabled={isSaving}
              >
                <X size={18} />
                Renunță
              </button>

              <button
                onClick={salveazaConsum}
                className="bg-black text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors shadow hover:shadow-md"
                disabled={isSaving}
                title='Salvare comanda'
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Salvare...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvează
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Modalul pentru adăugarea unui bun */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 animate-modal-enter">
            <button
              onClick={inchideModal}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-serif mb-6">Detalii bun de pe stoc</h2>

            <div className="grid grid-cols-3 gap-4 mb-4 items-center">
              <label className="font-serif text-lg">Bun:</label>
              <div className="col-span-2">
                <select
                  className="w-full p-2.5 border border-gray-300 bg-white rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={bunSelectat || ''}
                  onChange={(e) => setBunSelectat(Number(e.target.value) || null)}
                >
                  <option value="">Selectează bunul</option>
                  {bunuri.map(b => (
                    <option key={b.getId()} value={b.getId()}>{b.getNume()}</option>
                  ))}
                </select>
              </div>
            </div>

            {bunSelectat && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-800 text-white p-2 text-center">
                    Preț unitar
                  </div>
                  <div className="bg-gray-800 text-white p-2 text-center">
                    UM
                  </div>
                  <div className="bg-white p-2 text-center border border-gray-300">
                    {formatNumber(bunuri.find(b => b.getId() === bunSelectat)?.getPretUnitar())}
                  </div>
                  <div className="bg-white p-2 text-center border border-gray-300">
                    {bunuri.find(b => b.getId() === bunSelectat)?.getUM()}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                  <label className="font-serif text-lg">Cantitate necesară:</label>
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={cantitateNecesara}
                      onChange={(e) => setCantitateNecesara(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <label className="font-serif text-lg">Cantitate eliberată:</label>
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={cantitateEliberata}
                      onChange={(e) => setCantitateEliberata(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="bg-gray-800 text-white p-2.5 text-center mb-6 rounded">
                  Valoare bun consumat: {formatNumber(valoareCalculata)}
                </div>
              </>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={inchideModal}
                className="bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Renunță
              </button>

              <button
                onClick={adaugaBun}
                className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                disabled={!bunSelectat || !cantitateNecesara || !cantitateEliberata}
              >
                <Plus size={18} />
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta pentru cantitate insuficientă */}
      {showAlertaInsuficienta && bunCuCantitateInsuficienta && (
        <ConsumAlertaCantitateInsuficienta
          bun={bunCuCantitateInsuficienta}
          onConfirm={handleConfirmAlertaInsuficienta}
          onCancel={handleCancelAlertaInsuficienta}
        />
      )}

      {/* Modal pentru cerere de aprovizionare */}
      {showCerereAprovizionare && bunCuCantitateInsuficienta && (
        <ModalCerereAprovizionare
          bunInitial={bunCuCantitateInsuficienta}
          idCerere={cerereExistenta?.getId()}
          onClose={() => {
            setShowCerereAprovizionare(false);
            setBunCuCantitateInsuficienta(null);
          }}
          onSave={handleSaveCerereAprovizionare}
        />
      )}

      {/* Custom animations */}
      <style jsx>{`
                @keyframes modalEnter {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                @keyframes fadeInSlide {
                    from { 
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-modal-enter {
                    animation: modalEnter 0.3s ease-out;
                }
                
                .animate-fade-in-slide {
                    animation: fadeInSlide 0.3s ease-out;
                }
            `}</style>
    </div>
  );
};

export default CreareConsum;
