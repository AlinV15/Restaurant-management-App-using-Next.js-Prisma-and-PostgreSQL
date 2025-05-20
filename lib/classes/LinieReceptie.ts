import { Bun } from "./Bun"

export enum StatusLinieReceptie {
  RECEPTIONATA = "receptionata",
  PARTIALA = "partiala",
  RESPINSA = "respinsa",
}

export class LinieReceptie {
  constructor(
    public id_linie_receptie: number,
    public id_receptie: number,
    public id_bun: number,
    public cantitate_receptionata: number,
    public pret: number,
    public status: StatusLinieReceptie = StatusLinieReceptie.RECEPTIONATA,
    public validat = false,
    public bun?: Bun,
  ) {}

  static fromPrisma(data: any): LinieReceptie {
    return new LinieReceptie(
      data.id_linie_receptie,
      data.id_receptie,
      data.id_bun,
      Number(data.cantitate_receptionata),
      Number(data.pret),
      data.status as StatusLinieReceptie,
      data.validat ?? false,
      data.bun ? Bun.fromPrisma(data.bun) : undefined,
    )
  }

  static fromApi(data: any): LinieReceptie {
    return new LinieReceptie(
      data.id_linie_receptie || 0,
      data.id_receptie || 0,
      data.id_bun,
      Number(data.cantitate_receptionata),
      Number(data.pret),
      data.status || StatusLinieReceptie.RECEPTIONATA,
      data.validat ?? false,
      data.bun ? Bun.fromApi(data.bun) : undefined,
    )
  }

  toJson(): any {
    return {
      id_linie_receptie: this.id_linie_receptie,
      id_receptie: this.id_receptie,
      id_bun: this.id_bun,
      cantitate_receptionata: this.cantitate_receptionata,
      pret: this.pret,
      status: this.status,
      validat: this.validat,
    }
  }

  getValoare(): number {
    return Number(this.cantitate_receptionata) * Number(this.pret)
  }
}
