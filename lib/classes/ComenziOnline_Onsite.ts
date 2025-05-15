import { Comanda } from "./Comanda";
import { Masa } from "./Masa";

export class ComenziOnsite extends Comanda {
  constructor(
    id_comanda: number,
    data: Date,
    valoare: number,
    id_client: number,
    public id_masa: number,
    public masa?: Masa
  ) {
    super(id_comanda, data, valoare, id_client);
  }

  static fromPrisma(data: any): ComenziOnsite {
    return new ComenziOnsite(
      data.id_comanda,
      new Date(data.comanda?.data),
      Number(data.comanda?.valoare),
      data.comanda?.id_client,
      data.id_masa,
      data.masa ? Masa.fromPrisma(data.masa) : undefined
    );
  }
}

export class ComenziOnline extends Comanda {
  constructor(
    id_comanda: number,
    data: Date,
    valoare: number,
    id_client: number,
    public adresa_livrare: string
  ) {
    super(id_comanda, data, valoare, id_client);
  }

  static fromPrisma(data: any): ComenziOnline {
    return new ComenziOnline(
      data.id_comanda,
      new Date(data.comanda?.data),
      Number(data.comanda?.valoare),
      data.comanda?.id_client,
      data.adresa_livrare
    );
  }
}
