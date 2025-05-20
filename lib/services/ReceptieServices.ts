import type { LinieReceptie } from "../classes/LinieReceptie"

export class ReceptieService {
  static calcTotalValoare(linii: LinieReceptie[]) {
    return linii.reduce((acc, linie) => acc + Number(linie.cantitate_receptionata) * Number(linie.pret), 0)
  }

  static toApiPayload(cerereId: number | null, data: string, linii: LinieReceptie[], validat = false) {
    return {
      id_cerere_aprovizionare: cerereId,
      data,
      linii_receptie: linii.map((l) => ({
        id_bun: l.id_bun,
        cantitate_receptionata: l.cantitate_receptionata,
        pret: l.pret,
        status: l.status,
        validat: l.validat,
      })),
      validat,
    }
  }

  static verificaLiniiComplete(linii: LinieReceptie[]): boolean {
    return linii.every((l) => l.id_bun && l.cantitate_receptionata > 0 && l.pret > 0)
  }
}
