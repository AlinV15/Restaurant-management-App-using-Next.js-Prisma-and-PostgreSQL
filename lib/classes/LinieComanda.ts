export class LinieComanda {
  constructor(
    public id_linie_comanda: number,
    public id_comanda: number,
    public id_produs: number,
    public cantitate: number,
    public valoare: number
  ) {}

  static fromPrisma(data: any): LinieComanda {
    return new LinieComanda(
      data.id_linie_comanda,
      data.id_comanda,
      data.id_produs,
      data.cantitate,
      Number(data.valoare)
    );
  }

  valoareTotala(): number {
    return this.cantitate * this.valoare;
  }
}
