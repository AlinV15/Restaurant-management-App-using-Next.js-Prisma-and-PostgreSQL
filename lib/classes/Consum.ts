// lib/classes/Consum.ts

import { LinieConsum } from "./LinieConsum";

export abstract class Document {
  constructor(
    public nr_document: number,
    public data: Date
  ) { }

  abstract tipDocument(): string;
}

export class Consum extends Document {
  constructor(
    nr_document: number,
    data: Date,
    public valoare: number,
    public id_sef: number | null,
    public id_gestiune: number,
    public linii: LinieConsum[] = []
  ) {
    super(nr_document, data);
  }

  tipDocument(): string {
    return "Consum";
  }

  totalCantitati(): number {
    return this.linii.reduce((acc, linie) => acc + Number(linie.cant_eliberata), 0);
  }

  static placeholder(id: number): Consum {
    return new Consum(id, new Date(), 0, 0, 0);
  }

  getTotal(): number {
    return this.valoare;
  }

  toJson(): any {
    return {
      nr_document: this.nr_document,
      valoare: this.valoare,
      data: this.data.toISOString(),
      id_sef: this.id_sef,
      id_gestiune: this.id_gestiune,
      linii: this.linii.map(l => l.toJson())
    };
  }

  static fromApi(data: any): Consum {
    return new Consum(
      data.nr_document,
      new Date(data.data),
      Number(data.valoare),
      data.id_sef ?? null,
      data.id_gestiune,
      data.linii ? data.linii.map((l: any) => LinieConsum.fromApi(l)) : []
    );
  }

  static fromPrisma(data: any): Consum {
    return new Consum(
      data.nr_document,
      new Date(data.data),
      Number(data.valoare),
      data.id_sef ?? null,
      data.id_gestiune,
      data.liniiConsum ? data.liniiConsum.map((lc: any) => LinieConsum.fromPrisma(lc)) : []
    );
  }

  async actualizeazaInDB(prisma: any): Promise<void> {
    await prisma.consum.update({
      where: { nr_document: this.nr_document },
      data: {
        valoare: this.valoare,
        data: this.data,
        id_sef: this.id_sef,
        id_gestiune: this.id_gestiune,
      },
    });
  }

  async refaStocuriSiLinii(prisma: any, liniiNoi: LinieConsum[]): Promise<void> {
    const liniiVechi = await prisma.linieConsum.findMany({
      where: { id_consum: this.nr_document }
    });

    for (const linie of liniiVechi) {
      await prisma.bun.update({
        where: { id_bun: linie.id_bun },
        data: { cantitate_disponibila: { increment: linie.cant_eliberata } },
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: linie.id_bun,
          id_gestiune: this.id_gestiune,
        },
        data: { stoc_actual: { increment: linie.cant_eliberata } },
      });
    }

    await prisma.linieConsum.deleteMany({
      where: { id_consum: this.nr_document }
    });

    for (const linie of liniiNoi) {
      await prisma.linieConsum.create({
        data: {
          id_bun: linie.id_bun,
          id_consum: this.nr_document,
          cantitate_necesara: linie.cantitate_necesara,
          cant_eliberata: linie.cant_eliberata,
          valoare: linie.valoare,
        },
      });

      await prisma.bun.update({
        where: { id_bun: linie.id_bun },
        data: { cantitate_disponibila: { decrement: linie.cant_eliberata } },
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: linie.id_bun,
          id_gestiune: this.id_gestiune,
        },
        data: { stoc_actual: { decrement: linie.cant_eliberata } },
      });
    }
  }

  async stergeDinDB(prisma: any): Promise<void> {
    const linii = await prisma.linieConsum.findMany({
      where: { id_consum: this.nr_document }
    });

    for (const linie of linii) {
      await prisma.bun.update({
        where: { id_bun: linie.id_bun },
        data: { cantitate_disponibila: { increment: linie.cant_eliberata } },
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: linie.id_bun,
          id_gestiune: this.id_gestiune,
        },
        data: { stoc_actual: { increment: linie.cant_eliberata } },
      });
    }

    await prisma.linieConsum.deleteMany({
      where: { id_consum: this.nr_document }
    });

    await prisma.consum.delete({
      where: { nr_document: this.nr_document }
    });

    await prisma.document.delete({
      where: { nr_document: this.nr_document }
    });
  }

  static async createFromInput(body: any, prisma: any) {
    const { id_sef, id_gestiune, data, linii } = body;

    const document = await prisma.document.create({
      data: { data: new Date(data) || new Date() },
    });

    let valoareTotala = 0;

    const consum = await prisma.consum.create({
      data: {
        nr_document: document.nr_document,
        valoare: 0,
        id_sef: Number(id_sef),
        id_gestiune: Number(id_gestiune),
        data: new Date(data),
      },
    });

    const liniiCreate: any[] = [];

    for (const linie of linii) {
      const bun = await prisma.bun.findUnique({ where: { id_bun: linie.id_bun } });
      if (!bun) throw new Error("Bunul nu există");

      const stoc = await prisma.stoc.findFirst({
        where: {
          id_bun: linie.id_bun,
          id_gestiune: id_gestiune,
        }
      });

      if (!stoc) throw new Error("Stoc inexistent pentru bun și gestiune");

      if (linie.cant_eliberata > Number(bun.cantitate_disponibila)) {
        throw new Error(`Cantitate insuficientă pentru bunul ${bun.nume_bun}`);
      }

      await prisma.bun.update({
        where: { id_bun: linie.id_bun },
        data: { cantitate_disponibila: { decrement: linie.cant_eliberata } },
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: linie.id_bun,
          id_gestiune: id_gestiune,
        },
        data: { stoc_actual: { decrement: linie.cant_eliberata } },
      });

      const valoareLinie = Number(bun.pret_unitar) * Number(linie.cant_eliberata);
      valoareTotala += valoareLinie;

      const linieCreata = await prisma.linieConsum.create({
        data: {
          id_bun: linie.id_bun,
          id_consum: consum.nr_document,
          cantitate_necesara: linie.cantitate_necesara,
          cant_eliberata: linie.cant_eliberata,
          valoare: valoareLinie,
        },
      });

      liniiCreate.push(linieCreata);
    }

    await prisma.consum.update({
      where: { nr_document: consum.nr_document },
      data: { valoare: valoareTotala },
    });

    return {
      consum_id: consum.nr_document,
      valoare: valoareTotala,
      linii: liniiCreate,
    };
  }
}
