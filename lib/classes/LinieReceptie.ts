export enum StatusLinieReceptie {
  RECEPTIONATA = "receptionata",
  PARTIALA = "partiala",
  RESPINSA = "respinsa"
}

export class LinieReceptie {
  constructor(
    public id_linie_receptie: number,
    public id_bun: number,
    public id_receptie: number,
    public cantitate_receptionata: number,
    public pret: number,
    public status: StatusLinieReceptie = StatusLinieReceptie.RECEPTIONATA,
    public validat: boolean = false
  ) {}

  static fromPrisma(data: any): LinieReceptie {
    return new LinieReceptie(
      data.id_linie_receptie,
      data.id_bun,
      data.id_receptie,
      Number(data.cantitate_receptionata),
      Number(data.pret),
      data.status as StatusLinieReceptie,
      data.validat ?? false
    );
  }

  esteValidata(): boolean {
    return this.validat;
  }
}
