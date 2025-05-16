import { Document } from "./Consum";
import { LinieReceptie, StatusLinieReceptie } from "./LinieReceptie";

export class Receptie extends Document {
  constructor(
    nr_document: number,
    data: Date,
    public valoare_totala: number = 0,
    public linii: LinieReceptie[] = []
  ) {
    super(nr_document, data);
  }

  tipDocument(): string {
    return "Receptie";
  }

  calculeazaValoareTotala(): number {
    return this.linii.reduce((acc, linie) => acc + linie.pret * linie.cantitate_receptionata, 0);
  }

  static fromPrisma(data: any): Receptie {
    return new Receptie(
      data.id_receptie,
      new Date(data.data),
      Number(data.valoare_totala),
      data.linii_receptie ? data.linii_receptie.map((lr: any) => LinieReceptie.fromPrisma(lr)) : []
    );
  }
}
