"use client"

import { useState } from "react"
import { LinieReceptie, StatusLinieReceptie } from "@/lib/classes/LinieReceptie"
import type { Bun } from "@/lib/classes/Bun"

export function useLinieReceptie() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [bunSelectat, setBunSelectat] = useState<number | null>(null)
  const [cantitateReceptionata, setCantitateReceptionata] = useState<string>("")
  const [pretUnitar, setPretUnitar] = useState<string>("")
  const [statusLinie, setStatusLinie] = useState<StatusLinieReceptie>(StatusLinieReceptie.RECEPTIONATA)

  // Resetează formularul
  const resetForm = () => {
    setEditingIndex(null)
    setBunSelectat(null)
    setCantitateReceptionata("")
    setPretUnitar("")
    setStatusLinie(StatusLinieReceptie.RECEPTIONATA)
  }

  // Inițializează formularul pentru editare
  const initEditForm = (linie: LinieReceptie, index: number) => {
    setEditingIndex(index)
    setBunSelectat(linie.id_bun)
    setCantitateReceptionata(linie.cantitate_receptionata.toString())
    setPretUnitar(linie.pret.toString())
    setStatusLinie(linie.status)
  }

  // Creează o nouă linie de recepție
  const createLinieReceptie = (bun?: Bun): LinieReceptie | null => {
    if (!bunSelectat || !cantitateReceptionata || !pretUnitar) {
      return null
    }

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
  }

  return {
    editingIndex,
    bunSelectat,
    cantitateReceptionata,
    pretUnitar,
    statusLinie,
    setBunSelectat,
    setCantitateReceptionata,
    setPretUnitar,
    setStatusLinie,
    resetForm,
    initEditForm,
    createLinieReceptie,
  }
}
