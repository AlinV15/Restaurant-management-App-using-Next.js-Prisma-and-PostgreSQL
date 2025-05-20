import { create } from "zustand"
import type { Bun } from "@/lib/classes/Bun"
import { LinieReceptie } from "@/lib/classes/LinieReceptie"
import { Receptie } from "@/lib/classes/Receptie"
import type { CerereAprovizionare } from "@/lib/classes/CerereAprovizionare"
import type { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare"

interface ReceptieState {
  receptie: Receptie | null
  liniiReceptie: LinieReceptie[]
  cereriAprovizionare: CerereAprovizionare[]
  liniiCerereAprovizionare: LinieCerereAprovizionare[]
  bunuri: Bun[]
  isLoading: boolean
  isEditing: boolean
  showDeleteConfirm: boolean

  setReceptie: (receptie: Receptie) => void
  setLiniiReceptie: (linii: LinieReceptie[]) => void
  setCereriAprovizionare: (cereri: CerereAprovizionare[]) => void
  setLiniiCerereAprovizionare: (linii: LinieCerereAprovizionare[]) => void
  setBunuri: (bunuri: Bun[]) => void
  setIsLoading: (loading: boolean) => void
  setIsEditing: (editing: boolean) => void
  setShowDeleteConfirm: (show: boolean) => void

  adaugaLinieReceptie: (linie: LinieReceptie) => void
  actualizeazaLinieReceptie: (id: number, linie: LinieReceptie) => void
  stergeLinieReceptie: (id: number) => void

  getBunById: (id: number) => Bun | undefined
  getBunName: (id: number) => string
  getBunUM: (id: number) => string

  salveazaReceptie: () => Promise<any>
  valideazaReceptie: () => Promise<any>
  stergeReceptie: (id: number) => Promise<void>
}

export const useReceptieStore = create<ReceptieState>((set, get) => ({
  receptie: null,
  liniiReceptie: [],
  cereriAprovizionare: [],
  liniiCerereAprovizionare: [],
  bunuri: [],
  isLoading: true,
  isEditing: false,
  showDeleteConfirm: false,

  setReceptie: (receptie) => set({ receptie }),
  setLiniiReceptie: (linii) => set({ liniiReceptie: linii }),
  setCereriAprovizionare: (cereri) => set({ cereriAprovizionare: cereri }),
  setLiniiCerereAprovizionare: (linii) => set({ liniiCerereAprovizionare: linii }),
  setBunuri: (bunuri) => set({ bunuri }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsEditing: (editing) => set({ isEditing: editing }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),

  adaugaLinieReceptie: (linie) => {
    const linii = [...get().liniiReceptie, linie]
    set({ liniiReceptie: linii })

    // Actualizăm valoarea totală a recepției
    if (get().receptie) {
      const valoareTotala = linii.reduce((acc, l) => acc + l.getValoare(), 0)
      set({
        receptie: new Receptie(
          get().receptie!.nr_document,
          get().receptie!.data,
          valoareTotala,
          get().receptie!.id_cerere_aprovizionare,
          get().receptie!.validat,
          linii,
        ),
      })
    }
  },

  actualizeazaLinieReceptie: (id, linie) => {
    const linii = get().liniiReceptie.map((l) => (l.id_linie_receptie === id ? linie : l))
    set({ liniiReceptie: linii })

    // Actualizăm valoarea totală a recepției
    if (get().receptie) {
      const valoareTotala = linii.reduce((acc, l) => acc + l.getValoare(), 0)
      set({
        receptie: new Receptie(
          get().receptie!.nr_document,
          get().receptie!.data,
          valoareTotala,
          get().receptie!.id_cerere_aprovizionare,
          get().receptie!.validat,
          linii,
        ),
      })
    }
  },

  stergeLinieReceptie: (id) => {
    const linii = get().liniiReceptie.filter((l) => l.id_linie_receptie !== id)
    set({ liniiReceptie: linii })

    // Actualizăm valoarea totală a recepției
    if (get().receptie) {
      const valoareTotala = linii.reduce((acc, l) => acc + l.getValoare(), 0)
      set({
        receptie: new Receptie(
          get().receptie!.nr_document,
          get().receptie!.data,
          valoareTotala,
          get().receptie!.id_cerere_aprovizionare,
          get().receptie!.validat,
          linii,
        ),
      })
    }
  },

  getBunById: (id) => {
    return get().bunuri.find((b) => b.id_bun === id)
  },

  getBunName: (id) => {
    return get().bunuri.find((b) => b.id_bun === id)?.nume_bun ?? "Necunoscut"
  },

  getBunUM: (id) => {
    return get().bunuri.find((b) => b.id_bun === id)?.unitate_masura ?? ""
  },

  salveazaReceptie: async () => {
    try {
      const { receptie, liniiReceptie } = get()

      if (!receptie) throw new Error("Recepția nu există")

      const payload = {
        ...receptie.toJson(),
        linii_receptie: liniiReceptie.map((l) => l.toJson()),
      }

      let response

      if (receptie.nr_document) {
        // Actualizăm recepția existentă
        response = await fetch(`/api/receptie/${receptie.nr_document}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // Creăm o recepție nouă
        response = await fetch("/api/receptie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Eroare la salvarea recepției")
      }

      const result = await response.json()

      // Actualizăm starea cu recepția salvată
      set({
        receptie: Receptie.fromApi(result.receptie),
        liniiReceptie: result.linii_receptie.map(LinieReceptie.fromApi),
      })

      return result
    } catch (error) {
      console.error("Eroare în salveazaReceptie:", error)
      throw error
    }
  },

  valideazaReceptie: async () => {
    try {
      const { receptie, liniiReceptie } = get()

      if (!receptie) throw new Error("Recepția nu există")

      // Mai întâi salvăm recepția dacă nu are ID
      let receptieToValidate = receptie
      if (!receptie.nr_document) {
        const savedResult = await get().salveazaReceptie()
        receptieToValidate = Receptie.fromApi(savedResult.receptie)
      }

      // Actualizăm recepția ca fiind validată
      const payload = {
        ...receptieToValidate.toJson(),
        linii_receptie: liniiReceptie.map((l) => ({
          ...l.toJson(),
          validat: true,
        })),
        validat: true,
      }

      const response = await fetch(`/api/receptie/${receptieToValidate.nr_document}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Eroare la validarea recepției")
      }

      const result = await response.json()

      // Actualizăm starea cu recepția validată
      set({
        receptie: Receptie.fromApi(result),
        liniiReceptie: result.linii_receptie.map(LinieReceptie.fromApi),
      })

      return result
    } catch (error) {
      console.error("Eroare în valideazaReceptie:", error)
      throw error
    }
  },

  stergeReceptie: async (id) => {
    try {
      const response = await fetch(`/api/receptie/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Eroare la ștergerea recepției")
      }

      // Resetăm starea
      set({
        receptie: null,
        liniiReceptie: [],
      })
    } catch (error) {
      console.error("Eroare în stergeReceptie:", error)
      throw error
    }
  },
}))
