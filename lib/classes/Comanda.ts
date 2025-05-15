import { LinieComanda } from "./LinieComanda";
import { Client } from "./Client";

export class Comanda {
  constructor(
    public id_comanda: number,
    public data: Date,
    public valoare: number,
    public id_client: number,
    public linii: LinieComanda[] = [],
    public client?: Client
  ) {}

  static fromPrisma(data: any): Comanda {
    return new Comanda(
      data.id_comanda,
      new Date(data.data),
      Number(data.valoare),
      data.id_client,
      data.linie_comanda ? data.linie_comanda.map((lc: any) => LinieComanda.fromPrisma(lc)) : [],
      data.client ? Client.fromPrisma(data.client) : undefined
    );
  }

  totalProduse(): number {
    return this.linii.reduce((acc, linie) => acc + linie.cantitate, 0);
  }
}
