import { Document } from "./Consum"
import { LinieReceptie } from "./LinieReceptie"
import { CerereAprovizionare } from "./CerereAprovizionare"

export class Receptie extends Document {
  constructor(
    nr_document: number,
    data: Date,
    public id_cerere_aprovizionare: number | null,
    public linii_receptie: LinieReceptie[] = [],
    public valoare_totala = 0,
    public validat = false,
    public cerere_aprovizionare?: CerereAprovizionare,
  ) {
    super(nr_document, data)
  }

  tipDocument(): string {
    return "Recepție"
  }

  static fromPrisma(data: any): Receptie {
    return new Receptie(
      data.nr_document,
      new Date(data.data),
      data.id_cerere_aprovizionare,
      data.linii_receptie ? data.linii_receptie.map((l: any) => LinieReceptie.fromPrisma(l)) : [],
      Number(data.valoare_totala),
      data.validat,
      data.cerere_aprovizionare ? CerereAprovizionare.fromPrisma(data.cerere_aprovizionare) : undefined,
    )
  }

  static fromApi(data: any): Receptie {
    return new Receptie(
      data.nr_document,
      new Date(data.data),
      data.id_cerere_aprovizionare,
      data.linii_receptie ? data.linii_receptie.map((l: any) => LinieReceptie.fromPrisma(l)) : [],
      Number(data.valoare_totala),
      data.validat,
      data.cerere_aprovizionare ? CerereAprovizionare.fromPrisma(data.cerere_aprovizionare) : undefined,
    )
  }

  toJson(): any {
    return {
      nr_document: this.getId(),
      data: this.getData().toISOString(),
      id_cerere_aprovizionare: this.id_cerere_aprovizionare,
      valoare_totala: this.valoare_totala,
      validat: this.validat,
      linii_receptie: this.linii_receptie.map((l) => l.toJson()),
      cerere_aprovizionare: this.cerere_aprovizionare ? this.cerere_aprovizionare : undefined,
    }
  }

  calculeazaValoareTotala(): number {
    return this.linii_receptie.reduce((total, linie) => total + linie.getValoare(), 0)
  }

  actualizeazaInDB(prisma: any): Promise<any> {
    return Promise.resolve({})
  }

  valideazaInDB(prisma: any): Promise<any> {
    return Promise.resolve({})
  }

  async stergeDinDB(prisma: any): Promise<void> {
    // Ștergem liniile de recepție
    await prisma.linie_receptie.deleteMany({
      where: { id_receptie: this.getId() },
    })

    // Ștergem recepția
    await prisma.receptie.delete({
      where: { nr_document: this.getId() },
    })

    // Ștergem documentul
    await prisma.document.delete({
      where: { nr_document: this.getId() },
    })
  }
}
