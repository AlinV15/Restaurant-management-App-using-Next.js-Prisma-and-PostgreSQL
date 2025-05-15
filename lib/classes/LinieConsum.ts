export class LinieConsum {
  constructor(
    public id_linie_consum: number,
    public id_consum: number,
    public id_bun: number,
    public cantitate_necesara: number,
    public valoare: number,
    public cant_eliberata: number
  ) { }

  static fromPrisma(data: any): LinieConsum {
    return new LinieConsum(
      data.id_linie_consum,
      data.id_consum,
      data.id_bun,
      Number(data.cantitate_necesara),
      Number(data.valoare),
      Number(data.cant_eliberata)
    );
  }

  toJson(): any {
    return {
      id_linie_consum: this.id_linie_consum,
      id_consum: this.id_consum,
      id_bun: this.id_bun,
      cantitate_necesara: this.cantitate_necesara,
      cant_eliberata: this.cant_eliberata,
      valoare: this.valoare
    };
  }

  static fromApi(data: any): LinieConsum {
    return new LinieConsum(
      data.id_linie_consum,
      data.id_consum,
      data.id_bun,
      Number(data.cantitate_necesara),
      Number(data.cant_eliberata),
      Number(data.valoare)
    );
  }

  static async createInDB(prisma: any, data: any): Promise<any> {
    const { id_bun, id_consum, cantitate_necesara, cant_eliberata } = data;

    const bun = await prisma.bun.findUnique({ where: { id_bun } });
    if (!bun) throw new Error("Bun not found");

    const consum = await prisma.consum.findUnique({ where: { id_consum } });
    if (!consum) throw new Error("Consum not found");

    const stoc = await prisma.stoc.findFirst({
      where: {
        id_bun,
        id_gestiune: consum.id_gestiune,
      }
    });
    if (!stoc) throw new Error("Bunul nu este înregistrat în stoc");

    if (cant_eliberata > Number(bun.cantitate_disponibila)) {
      throw new Error("Cantitate insuficientă. Cerere de aprovizionare necesară.");
    }

    const valoare = Number(bun.pret_unitar) * cant_eliberata;

    await prisma.bun.update({
      where: { id_bun },
      data: {
        cantitate_disponibila: { decrement: cant_eliberata }
      }
    });

    await prisma.stoc.updateMany({
      where: {
        id_bun,
        id_gestiune: consum.id_gestiune,
      },
      data: {
        stoc_actual: { decrement: cant_eliberata }
      }
    });

    const linie = await prisma.linieConsum.create({
      data: {
        id_bun,
        id_consum,
        cantitate_necesara,
        cant_eliberata,
        valoare,
      }
    });

    await prisma.consum.update({
      where: { id_consum },
      data: {
        valoare: { increment: valoare }
      }
    });

    return linie;
  }


  static async updateInDB(prisma: any, id: number, data: any): Promise<any> {
    const bun = await prisma.bun.findUnique({ where: { id_bun: data.id_bun } });
    if (!bun) throw new Error("Bun not found");

    const valoareNoua = Number(bun.pret_unitar) * data.cant_eliberata;

    const linieVeche = await prisma.linieConsum.findUnique({ where: { id_linie_consum: id } });
    if (!linieVeche) throw new Error("Linie consum inexistentă");

    const diferenta = data.cant_eliberata - linieVeche.cant_eliberata;

    await prisma.bun.update({
      where: { id_bun: data.id_bun },
      data: { cantitate_disponibila: { decrement: diferenta } }
    });

    const consum = await prisma.consum.findUnique({ where: { id_consum: data.id_consum } });

    await prisma.stoc.updateMany({
      where: {
        id_bun: data.id_bun,
        id_gestiune: consum?.id_gestiune
      },
      data: {
        stoc_actual: { decrement: diferenta }
      }
    });

    await prisma.consum.update({
      where: { id_consum: data.id_consum },
      data: {
        valoare: { increment: valoareNoua - linieVeche.valoare }
      }
    });

    return await prisma.linieConsum.update({
      where: { id_linie_consum: id },
      data: {
        ...data,
        valoare: valoareNoua
      }
    });
  }

  static async deleteFromDB(prisma: any, id: number): Promise<void> {
    const linie = await prisma.linieConsum.findUnique({ where: { id_linie_consum: id } });
    if (!linie) throw new Error("Linie inexistentă");

    await prisma.consum.update({
      where: { id_consum: linie.id_consum },
      data: {
        valoare: { decrement: Number(linie.valoare) }
      }
    });

    await prisma.bun.update({
      where: { id_bun: linie.id_bun },
      data: {
        cantitate_disponibila: { increment: Number(linie.cant_eliberata) }
      }
    });

    const consum = await prisma.consum.findUnique({ where: { id_consum: linie.id_consum } });

    await prisma.stoc.updateMany({
      where: {
        id_bun: linie.id_bun,
        id_gestiune: consum?.id_gestiune
      },
      data: {
        stoc_actual: { increment: Number(linie.cant_eliberata) }
      }
    });

    await prisma.linieConsum.delete({ where: { id_linie_consum: id } });
  }


  diferenta(): number {
    return this.cantitate_necesara - this.cant_eliberata;
  }


}
