"use client"

import { useState, useEffect, useCallback } from "react"
import { Receptie } from "@/lib/classes/Receptie"
import { LinieReceptie, StatusLinieReceptie } from "@/lib/classes/LinieReceptie"
import { Bun } from "@/lib/classes/Bun"
import toast from "react-hot-toast"
import { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare"

export function useReceptie() {
  // Starea principală a recepției
  const [receptie, setReceptie] = useState<Receptie>(new Receptie(0, new Date(), null, [], 0, false))

  // Stări pentru datele externe
  const [cereriDisponibile, setCereriDisponibile] = useState<any[]>([])
  const [liniiCerere, setLiniiCerere] = useState<any[]>([])
  const [bunuri, setBunuri] = useState<Bun[]>([])

  // Stări pentru UI
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [cerereSelectata, setCerereSelectata] = useState<number | null>(null)

  // Stări pentru dialogul de adăugare linie
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [bunSelectat, setBunSelectat] = useState<number | null>(null)
  const [cantitateReceptionata, setCantitateReceptionata] = useState<string>("")
  const [pretUnitar, setPretUnitar] = useState<string>("")
  const [statusLinie, setStatusLinie] = useState<StatusLinieReceptie>(StatusLinieReceptie.RECEPTIONATA)

  // Încarcă datele inițiale
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        console.log("Încărcare date inițiale...")

        // Încarcă cererile de aprovizionare disponibile
        const resCereri = await fetch("/api/cerere-aprovizionare")
        const cereriData = await resCereri.json()
        console.log("Cereri încărcate:", cereriData)
        setCereriDisponibile(cereriData)

        // Încarcă bunurile
        const resBunuri = await fetch("/api/bun")
        const bunuriData = await resBunuri.json()
        console.log("Bunuri încărcate:", bunuriData)
        setBunuri(bunuriData.map((b: any) => Bun.fromPrisma(b)))

        setIsLoading(false)
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error)
        toast.error("Eroare la încărcarea datelor")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Resetează formularul de adăugare linie
  const resetForm = useCallback(() => {
    setEditingIndex(null)
    setBunSelectat(null)
    setCantitateReceptionata("")
    setPretUnitar("")
    setStatusLinie(StatusLinieReceptie.RECEPTIONATA)
  }, [])

  // Inițializează formularul pentru editare
  const initEditForm = useCallback((linie: LinieReceptie, index: number) => {
    setEditingIndex(index)
    setBunSelectat(linie.id_bun)
    setCantitateReceptionata(linie.cantitate_receptionata.toString())
    setPretUnitar(linie.pret.toString())
    setStatusLinie(linie.status)
    setIsAddDialogOpen(true)
  }, [])

  // Setează cererea de aprovizionare selectată
  const selecteazaCerere = useCallback(
    async (id: number) => {
      try {
        console.log("Selectare cerere:", id)

        if (!id) {
          console.log("ID cerere invalid")
          return
        }

        setCerereSelectata(id)

        // Încărcăm liniile cererii
        const res = await fetch(`/api/cerere-aprovizionare/${id}`)
        if (!res.ok) {
          throw new Error(`Eroare la încărcarea liniilor cererii: ${res.statusText}`)
        }

        const data = await res.json()

        const linii = data.linii;

        console.log("Linii cerere încărcate:", linii)
        setLiniiCerere(linii)

        receptie.linii_receptie = linii.map((l: any) => {

          if (!l.bun) {
            console.error(`Bun cu ID ${l.id_bun} nu a fost găsit în lista de bunuri`)
            return
          }
          return new LinieReceptie(l.id_linie_receptie, 0, l.id_bun, l.cantitate, l.bun?.pret_unitar, l.status, false, l.bun)
        })

        // Actualizăm recepția cu cererea selectată
        const newReceptie = new Receptie(
          receptie.getId(),
          receptie.getData(),
          id,
          receptie.linii_receptie,
          receptie.valoare_totala,
          receptie.validat,
        )

        console.log("Recepție actualizată:", newReceptie)
        setReceptie(newReceptie)
      } catch (error) {
        console.error("Eroare la selectarea cererii:", error)
        toast.error("Eroare la selectarea cererii")
      }
    },
    [receptie],
  )

  // Creează o nouă linie de recepție
  const createLinieReceptie = useCallback((): LinieReceptie | null => {
    if (!bunSelectat || !cantitateReceptionata || !pretUnitar) {
      return null
    }

    const bun = bunuri.find((b) => b.getId() === bunSelectat)

    return new LinieReceptie(
      0, // ID-ul va fi generat de baza de date
      0, // ID-ul recepției va fi setat când se salvează recepția
      bunSelectat,
      Number(cantitateReceptionata),
      Number(pretUnitar),
      statusLinie,
      false,
      bun,
    )
  }, [bunSelectat, cantitateReceptionata, pretUnitar, statusLinie, bunuri])

  // Adaugă o linie de recepție
  const adaugaLinie = useCallback(() => {
    console.log("Adăugare linie cu bun:", bunSelectat)
    const linie = createLinieReceptie()

    if (linie) {
      console.log("Linie creată:", linie)

      // Creăm o copie a liniilor existente și adăugăm noua linie
      const liniiNoi = [...receptie.linii_receptie, linie]

      // Calculăm valoarea totală
      const valoareTotala = liniiNoi.reduce((total, l) => total + Number(l.cantitate_receptionata) * Number(l.pret), 0)

      // Actualizăm recepția
      const newReceptie = new Receptie(
        receptie.getId(),
        receptie.getData(),
        receptie.id_cerere_aprovizionare,
        liniiNoi,
        valoareTotala,
        receptie.validat,
      )

      console.log("Recepție actualizată după adăugare linie:", newReceptie)
      setReceptie(newReceptie)
      setIsAddDialogOpen(false)
      resetForm()
      toast.success("Linie adăugată cu succes")
      return true
    } else {
      toast.error("Completați toate câmpurile obligatorii")
      return false
    }
  }, [receptie, bunSelectat, createLinieReceptie, resetForm])

  // Actualizează o linie de recepție
  const actualizeazaLinie = useCallback(() => {
    if (editingIndex === null) {
      toast.error("Nicio linie selectată pentru editare")
      return false
    }

    const linie = createLinieReceptie()

    if (linie) {
      // Creăm o copie a liniilor existente
      const liniiNoi = [...receptie.linii_receptie]

      // Înlocuim linia la indexul specificat
      liniiNoi[editingIndex] = linie

      // Calculăm valoarea totală
      const valoareTotala = liniiNoi.reduce((total, l) => total + Number(l.cantitate_receptionata) * Number(l.pret), 0)

      // Actualizăm recepția
      const newReceptie = new Receptie(
        receptie.getId(),
        receptie.getData(),
        receptie.id_cerere_aprovizionare,
        liniiNoi,
        valoareTotala,
        receptie.validat,
      )

      console.log("Recepție actualizată după editare linie:", newReceptie)
      setReceptie(newReceptie)
      setIsAddDialogOpen(false)
      resetForm()
      toast.success("Linie actualizată cu succes")
      return true
    } else {
      toast.error("Completați toate câmpurile obligatorii")
      return false
    }
  }, [receptie, editingIndex, createLinieReceptie, resetForm])

  // Șterge o linie de recepție
  const stergeLinie = useCallback(
    (index: number) => {
      console.log("Ștergere linie la indexul:", index)

      // Creăm o copie a liniilor și eliminăm linia la indexul specificat
      const liniiNoi = [...receptie.linii_receptie]
      liniiNoi.splice(index, 1)

      // Calculăm valoarea totală
      const valoareTotala = liniiNoi.reduce((total, l) => total + Number(l.cantitate_receptionata) * Number(l.pret), 0)

      // Actualizăm recepția
      const newReceptie = new Receptie(
        receptie.getId(),
        receptie.getData(),
        receptie.id_cerere_aprovizionare,
        liniiNoi,
        valoareTotala,
        receptie.validat,
      )

      console.log("Recepție actualizată după ștergere linie:", newReceptie)
      setReceptie(newReceptie)
      toast.success("Linie ștearsă cu succes")
    },
    [receptie],
  )

  // Salvează recepția
  const salveazaReceptie = useCallback(async () => {
    if (receptie.linii_receptie.length === 0) {
      toast.error("Adăugați cel puțin o linie de recepție")
      return false
    }

    setIsSaving(true)

    try {
      // Pregătim datele pentru salvare
      const receptieData = {
        data: receptie.getData(),
        id_cerere_aprovizionare: receptie.id_cerere_aprovizionare,
        valoare_totala: receptie.valoare_totala,
        validat: false,
        linii_receptie: receptie.linii_receptie.map((l) => ({
          id_bun: l.id_bun,
          cantitate_receptionata: l.cantitate_receptionata,
          pret: l.pret,
          status: l.status,
        })),
      }

      console.log("Salvare recepție:", receptieData)

      // Salvăm recepția
      const res = await fetch("/api/receptie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receptieData),
      })

      if (!res.ok) {
        throw new Error("Eroare la salvarea recepției")
      }

      const data = await res.json()
      toast.success("Recepția a fost salvată cu succes")

      // Actualizăm recepția cu ID-ul generat
      const savedReceptie = new Receptie(
        data.nr_document,
        new Date(data.data),
        data.id_cerere_aprovizionare,
        receptie.linii_receptie,
        data.valoare_totala,
        data.validat,
      )

      setReceptie(savedReceptie)
      return true
    } catch (error) {
      console.error("Eroare la salvarea recepției:", error)
      toast.error("Eroare la salvarea recepției")
      return false
    } finally {
      setIsSaving(false)
    }
  }, [receptie])

  // Validează recepția
  const valideazaReceptie = useCallback(async () => {
    if (receptie.linii_receptie.length === 0) {
      toast.error("Adăugați cel puțin o linie de recepție")
      return false
    }

    setIsSaving(true)

    try {
      // Pregătim datele pentru validare
      const receptieData = {
        data: receptie.getData(),
        id_cerere_aprovizionare: receptie.id_cerere_aprovizionare,
        valoare_totala: receptie.valoare_totala,
        validat: true,
        linii_receptie: receptie.linii_receptie.map((l) => ({
          id_bun: l.id_bun,
          cantitate_receptionata: l.cantitate_receptionata,
          pret: l.pret,
          status: l.status,
        })),
      }

      console.log("Validare recepție:", receptieData)

      // Salvăm și validăm recepția
      const res = await fetch("/api/receptie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receptieData),
      })

      if (!res.ok) {
        throw new Error("Eroare la validarea recepției")
      }

      toast.success("Recepția a fost validată cu succes")
      return true
    } catch (error) {
      console.error("Eroare la validarea recepției:", error)
      toast.error("Eroare la validarea recepției")
      return false
    } finally {
      setIsSaving(false)
    }
  }, [receptie])

  return {
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
  }
}
