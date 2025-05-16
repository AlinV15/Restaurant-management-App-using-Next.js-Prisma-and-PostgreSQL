import { Angajat } from "./Angajat";
import { Comanda } from "./Comanda";

export enum StatusLivrare {
  IN_ASTEPTARE = "În așteptare",
  IN_CURS_DE_LIVRARE = "În curs de livrare",
  LIVRATA = "Livrată",
  ANULATA = "Anulată",
  NECONFIRMATA = "Neconfirmată"
}

export class Livrare {
  constructor(
    public id_livrare: number,
    public id_comanda: number,
    public adresa_livrare: string,
    public id_angajat: number,
    public data_livrare: Date,
    public status_livrare: StatusLivrare,
    public comanda?: Comanda,
    public angajat?: Angajat
  ) {}

  static fromPrisma(data: any): Livrare {
    return new Livrare(
      data.id_livrare,
      data.id_comanda,
      data.adresa_livrare,
      data.id_angajat,
      new Date(data.data_livrare),
      data.status_livrare as StatusLivrare,
      data.comanda ? Comanda.fromPrisma(data.comanda) : undefined,
      data.angajat ? Angajat.fromPrisma(data.angajat) : undefined
    );
  }

  esteLivrata(): boolean {
    return this.status_livrare === StatusLivrare.LIVRATA;
  }
}
