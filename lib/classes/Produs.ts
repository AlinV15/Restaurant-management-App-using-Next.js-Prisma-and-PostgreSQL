export class Produs {
  constructor(
    public id_produs: number,
    public pret: number,
    public cantitate: number,
    public um: string,
    public denumire: string,
    public id_reteta?: number
  ) {}

  static fromPrisma(data: any): Produs {
    return new Produs(
      data.id_produs,
      Number(data.pret),
      Number(data.cantitate),
      data.um,
      data.denumire,
      data.id_reteta ?? undefined
    );
  }

  esteInStoc(): boolean {
    return this.cantitate > 0;
  }
}
