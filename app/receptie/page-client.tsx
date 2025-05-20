"use client"

import { useState, useEffect } from "react"

// Enums
enum StatusLinieReceptie {
  RECEPTIONATA = "receptionata",
  PARTIALA = "partiala",
  RESPINSA = "respinsa",
}

enum StatusCerereAprovizionare {
  IN_ASTEPTARE = "în așteptare",
  APROBATA = "aprobată",
  RESPINSA = "respinsă",
  FINALIZATA = "finalizată",
}

// Interfaces
interface Bun {
  id_bun: number
  denumire: string
  um: string
  pret_estimativ?: number
}

interface CerereAprovizionare {
  id_cerere: number
  data: Date
  status: StatusCerereAprovizionare
  id_gestiune: number
  valoare_totala: number
}

interface LinieCerereAprovizionare {
  id_linie_cerere: number
  id_cerere: number
  id_bun: number
  cantitate: number
  pret_estimativ: number
  bun: Bun
}

interface LinieReceptie {
  id_linie_receptie?: number
  id_receptie?: number
  id_bun: number
  cantitate_receptionata: number
  pret: number
  status: StatusLinieReceptie
  validat: boolean
  bun: Bun
}

interface Receptie {
  id_receptie?: number
  data: Date
  id_cerere_aprovizionare: number
  valoare_totala: number
  linii_receptie: LinieReceptie[]
}

// Mock data
const bunuri: Bun[] = [
  { id_bun: 1, denumire: "Făină albă", um: "kg" },
  { id_bun: 2, denumire: "Zahăr", um: "kg" },
  { id_bun: 3, denumire: "Ulei", um: "l" },
  { id_bun: 4, denumire: "Ouă", um: "buc" },
  { id_bun: 5, denumire: "Lapte", um: "l" },
]

const cereriAprovizionare: CerereAprovizionare[] = [
  {
    id_cerere: 101,
    data: new Date(2025, 4, 1),
    status: StatusCerereAprovizionare.APROBATA,
    id_gestiune: 1,
    valoare_totala: 1250,
  },
  {
    id_cerere: 102,
    data: new Date(2025, 4, 5),
    status: StatusCerereAprovizionare.APROBATA,
    id_gestiune: 1,
    valoare_totala: 850,
  },
  {
    id_cerere: 103,
    data: new Date(2025, 4, 8),
    status: StatusCerereAprovizionare.IN_ASTEPTARE,
    id_gestiune: 2,
    valoare_totala: 1500,
  },
]

const liniiCerereAprovizionare: LinieCerereAprovizionare[] = [
  { id_linie_cerere: 1, id_cerere: 101, id_bun: 1, cantitate: 30, pret_estimativ: 5, bun: bunuri[0] },
  { id_linie_cerere: 2, id_cerere: 101, id_bun: 2, cantitate: 20, pret_estimativ: 8, bun: bunuri[1] },
  { id_linie_cerere: 3, id_cerere: 101, id_bun: 3, cantitate: 15, pret_estimativ: 12, bun: bunuri[2] },
  { id_linie_cerere: 4, id_cerere: 102, id_bun: 4, cantitate: 100, pret_estimativ: 1.5, bun: bunuri[3] },
  { id_linie_cerere: 5, id_cerere: 102, id_bun: 5, cantitate: 25, pret_estimativ: 6, bun: bunuri[4] },
]

export default function ReceptiePageClient() {
  // State
  const [receptie, setReceptie] = useState<Receptie>({
    data: new Date(),
    id_cerere_aprovizionare: 0,
    valoare_totala: 0,
    linii_receptie: [],
  })

  const [cereriDisponibile, setCereriDisponibile] = useState<CerereAprovizionare[]>([])
  const [liniiCerere, setLiniiCerere] = useState<LinieCerereAprovizionare[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)
  const [receptieValidata, setReceptieValidata] = useState(false)
  const [observatii, setObservatii] = useState("")

  const [bunSelectat, setBunSelectat] = useState<number | null>(null)
  const [cantitateReceptionata, setCantitateReceptionata] = useState<number>(0)
  const [pretUnitar, setPretUnitar] = useState<number>(0)

  // Filtered cereri - only show approved ones
  useEffect(() => {
    // Folosim datele mock pentru simplitate
    const cereriAprobate = cereriAprovizionare.filter((cerere) => cerere.status === StatusCerereAprovizionare.APROBATA)
    setCereriDisponibile(cereriAprobate)
  }, [])

  // Load linii cerere when a cerere is selected
  useEffect(() => {
    if (receptie.id_cerere_aprovizionare) {
      // Folosim datele mock pentru simplitate
      const linii = liniiCerereAprovizionare.filter((linie) => linie.id_cerere === receptie.id_cerere_aprovizionare)
      setLiniiCerere(linii)
    } else {
      setLiniiCerere([])
    }
  }, [receptie.id_cerere_aprovizionare])

  // Calculate total value whenever linii_receptie changes
  useEffect(() => {
    const total = receptie.linii_receptie.reduce((sum, linie) => sum + linie.cantitate_receptionata * linie.pret, 0)
    setReceptie((prev) => ({ ...prev, valoare_totala: total }))
  }, [receptie.linii_receptie])

  // Funcție simplă pentru formatarea datei
  function formatDate(date: Date, format = "dd.MM.yyyy"): string {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    return format.replace("dd", day).replace("MM", month).replace("yyyy", year.toString())
  }

  return (
    <div>
      {/* Acest fișier conține doar logica, nu și UI-ul */}
      <p>Acest fișier conține doar logica client-side. Interfața este în page.tsx.</p>
    </div>
  )
}