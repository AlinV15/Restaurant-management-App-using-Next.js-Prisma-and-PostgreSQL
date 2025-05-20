"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../components/Sidebar"
import LoadingSpinner from "../components/LoadingSpinner"
import { useReceptie } from "../hooks/useReceptie"
import { StatusLinieReceptie } from "@/lib/classes/LinieReceptie"
import { Plus, Save, X, Check, AlertTriangle, Loader2, Edit, Trash2 } from "lucide-react"

export default function ReceptiePage() {
  const router = useRouter()
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)

  const {
    // Stări
    receptie,
    cereriDisponibile,
    liniiCerere,
    bunuri,
    isLoading,
    isSaving,
    cerereSelectata,
    isAddDialogOpen,
    editingIndex,
    bunSelectat,
    cantitateReceptionata,
    pretUnitar,
    statusLinie,

    // Setteri pentru stări
    setIsAddDialogOpen,
    setBunSelectat,
    setCantitateReceptionata,
    setPretUnitar,
    setStatusLinie,

    // Funcții
    selecteazaCerere,
    resetForm,
    initEditForm,
    adaugaLinie,
    actualizeazaLinie,
    stergeLinie,
    salveazaReceptie,
    valideazaReceptie,
  } = useReceptie()

  // Formatare dată
  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("ro-RO")
  }

  // Calculează valoarea totală
  const calculeazaValoareTotala = () => {
    return receptie.linii_receptie.reduce(
      (total, linie) => total + Number(linie.cantitate_receptionata) * Number(linie.pret),
      0,
    )
  }

  // Gestionează selectarea cererii de aprovizionare
  const handleSelectCerere = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    console.log("Selectare cerere cu ID:", id)
    if (id) {
      selecteazaCerere(id)
    }
  }

  // Gestionează deschiderea dialogului de adăugare linie
  const handleOpenAddDialog = () => {
    console.log("Deschidere dialog adăugare linie")
    resetForm()
    setIsAddDialogOpen(true)
  }

  // Gestionează editarea unei linii
  const handleEditLinie = (linie: any, index: number) => {
    initEditForm(linie, index)
  }

  // Gestionează salvarea recepției
  const handleSalveazaReceptie = async () => {
    const success = await salveazaReceptie()
    if (success) {
      router.push("/receptii")
    }
  }

  // Gestionează validarea recepției
  const handleValideazaReceptie = async () => {
    const success = await valideazaReceptie()
    if (success) {
      setIsVerifyDialogOpen(false)
      router.push("/receptii")
    }
  }

  if (isLoading) {
    return (
      <div className="flex">
        <div className="w-1/5">
          <Sidebar />
        </div>
        <div className="w-4/5 flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <div className="w-1/5">
        <Sidebar />
      </div>
      <div className="w-4/5 p-8">
        <h1 className="text-3xl font-bold mb-6">Formular Recepție</h1>

        {/* Cerere aprovizionare selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Cerere de aprovizionare</label>
          <select
            className="w-full p-2 border rounded"
            value={cerereSelectata || ""}
            onChange={handleSelectCerere}
            disabled={receptie.linii_receptie.length > 0}
          >
            <option key="default" value="">
              Selectează cererea de aprovizionare
            </option>
            {cereriDisponibile && cereriDisponibile.length > 0 ? (
              cereriDisponibile.map((cerere) => (
                <option key={cerere.nr_document} value={cerere.nr_document}>
                  Cerere #{cerere.nr_document} din {formatDate(cerere.data)} - {Number(cerere.valoare).toFixed(2)} RON
                </option>
              ))
            ) : (
              <option key="no-cereri" value="" disabled>
                Nu există cereri disponibile
              </option>
            )}
          </select>
        </div>

        {/* Date and document info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Data recepție</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={
                receptie.getData()
                  ? new Date(receptie.getData()).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              onChange={(e) => {
                if (typeof receptie.setData === "function") {
                  receptie.setData(new Date(e.target.value))
                } else {
                  receptie.setData(new Date(e.target.value));
                }
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Număr document</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              value={receptie.getId() || "Se va genera automat"}
              disabled
            />
          </div>
        </div>

        {/* Lines section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Linii recepție</h2>
            <button
              onClick={handleOpenAddDialog}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              disabled={!cerereSelectata}
            >
              <Plus size={16} /> Adaugă linie
            </button>
          </div>

          <div className="bg-white shadow rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bun
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantitate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preț unitar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valoare
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receptie.linii_receptie.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Nu există linii de recepție. Folosiți butonul "Adaugă linie" pentru a adăuga.
                    </td>
                  </tr>
                ) : (
                  receptie.linii_receptie.map((linie, index) => {
                    const bun = bunuri.find((b) => b.getId() === linie.id_bun)
                    return (
                      <tr key={`linie-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{bun?.getNume() || `Bun #${linie.id_bun}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{linie.cantitate_receptionata}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{linie.pret} RON</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(Number(linie.cantitate_receptionata) * Number(linie.pret)).toFixed(2)} RON
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${linie.status === StatusLinieReceptie.RECEPTIONATA
                                ? "bg-green-100 text-green-800"
                                : linie.status === StatusLinieReceptie.PARTIALA
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                          >
                            {linie.status === StatusLinieReceptie.RECEPTIONATA
                              ? "Recepționată"
                              : linie.status === StatusLinieReceptie.PARTIALA
                                ? "Parțială"
                                : "Respinsă"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditLinie(linie, index)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button onClick={() => stergeLinie(index)} className="text-red-600 hover:text-red-900">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {receptie.linii_receptie.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-4 text-right font-medium">
                      Total:
                    </td>
                    <td className="px-6 py-4 font-bold">{calculeazaValoareTotala().toFixed(2)} RON</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.push("/receptii")}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded flex items-center gap-2"
          >
            <X size={18} /> Anulează
          </button>
          <button
            onClick={() => setIsVerifyDialogOpen(true)}
            className="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2"
            disabled={receptie.linii_receptie.length === 0 || isSaving}
          >
            <Check size={18} /> Validează și salvează
          </button>
          <button
            onClick={handleSalveazaReceptie}
            className="bg-black text-white px-6 py-2 rounded flex items-center gap-2"
            disabled={receptie.linii_receptie.length === 0 || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Salvare...
              </>
            ) : (
              <>
                <Save size={18} /> Salvează
              </>
            )}
          </button>
        </div>

        {/* Add/Edit Line Dialog */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingIndex !== null ? "Editează linie" : "Adaugă linie recepție"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bun</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={bunSelectat || ""}
                    onChange={(e) => setBunSelectat(Number(e.target.value))}
                    disabled={editingIndex !== null}
                  >
                    <option key="default-bun" value="">
                      Selectează bun
                    </option>
                    {liniiCerere && liniiCerere.length > 0 ? (
                      liniiCerere.map((linie) => {
                        // Găsim bunul asociat liniei
                        const bunAsociat = bunuri.find((b) => b.getId() === linie.id_bun)
                        return (
                          <option key={`bun-${linie.id_bun}`} value={linie.id_bun}>
                            {bunAsociat?.getNume() || `Bun #${linie.id_bun}`} - Cantitate cerută: {linie.cantitate}
                          </option>
                        )
                      })
                    ) : (
                      <option key="no-bunuri" value="" disabled>
                        Nu există bunuri disponibile
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cantitate recepționată</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={cantitateReceptionata}
                    onChange={(e) => setCantitateReceptionata(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preț unitar</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={pretUnitar}
                    onChange={(e) => setPretUnitar(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={statusLinie}
                    onChange={(e) => setStatusLinie(e.target.value as StatusLinieReceptie)}
                  >
                    <option key="status-receptionata" value={StatusLinieReceptie.RECEPTIONATA}>
                      Recepționată
                    </option>
                    <option key="status-partiala" value={StatusLinieReceptie.PARTIALA}>
                      Parțială
                    </option>
                    <option key="status-respinsa" value={StatusLinieReceptie.RESPINSA}>
                      Respinsă
                    </option>
                  </select>
                </div>

                {bunSelectat && (
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="text-sm">
                      Valoare:{" "}
                      <span className="font-bold">
                        {(Number(cantitateReceptionata || 0) * Number(pretUnitar || 0)).toFixed(2)} RON
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Anulează
                </button>
                <button
                  onClick={editingIndex !== null ? actualizeazaLinie : adaugaLinie}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={!bunSelectat || !cantitateReceptionata || !pretUnitar}
                >
                  {editingIndex !== null ? "Actualizează" : "Adaugă"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Confirmation Dialog */}
        {isVerifyDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center mb-4 text-amber-600">
                <AlertTriangle size={24} className="mr-2" />
                <h2 className="text-xl font-semibold">Confirmă validarea</h2>
              </div>

              <p className="mb-4">
                Sunteți sigur că doriți să validați această recepție? Această acțiune va actualiza stocurile și nu poate
                fi anulată.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsVerifyDialogOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Anulează
                </button>
                <button
                  onClick={handleValideazaReceptie}
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Check size={18} /> Validează
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
