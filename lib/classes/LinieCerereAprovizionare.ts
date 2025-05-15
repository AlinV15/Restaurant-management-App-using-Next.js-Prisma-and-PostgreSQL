export class LinieCerereAprovizionare {
  constructor(
    public id: number,
    public id_cerere: number,
    public id_bun: number,
    public cantitate: number,
    public valoare: number,
    public observatii?: string
  ) { }

  static fromPrisma(data: any): LinieCerereAprovizionare {
    return new LinieCerereAprovizionare(
      data.id,
      data.id_cerere,
      data.id_bun,
      Number(data.cantitate),
      Number(data.valoare),
      data.observatii ?? undefined
    );
  }

  static async createInDB(prisma: any, data: any): Promise<any> {
    const { id_cerere, id_bun, cantitate, observatii } = data;

    const bun = await prisma.bun.findUnique({ where: { id_bun } });
    if (!bun) throw new Error("Bun not found");

    const valoare = Number(bun.pret_unitar) * cantitate;

    const linieNoua = await prisma.linieCerereAprovizionare.create({
      data: { id_cerere, id_bun, cantitate, valoare, observatii }
    });

    const cerere = await prisma.cerereAprovizionare.update({
      where: { id_cerere },
      data: { valoare: { increment: valoare } }
    });

    if (cerere.status === "APROBATA") {
      await prisma.bun.update({
        where: { id_bun },
        data: {
          cantitate_disponibila: { increment: cantitate }
        }
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun,
          id_gestiune: cerere.id_gestiune
        },
        data: {
          stoc_actual: { increment: cantitate }
        }
      });
    }

    return linieNoua;
  }


  static async updateInDB(prisma: any, id: number, data: any): Promise<any> {
    const bun = await prisma.bun.findUnique({ where: { id_bun: data.id_bun } });
    if (!bun) throw new Error("Bun not found");

    const valoare = Number(bun.pret_unitar) * data.cantitate;

    const linieVechi = await prisma.linieCerereAprovizionare.findUnique({ where: { id } });

    const linieNoua = await prisma.linieCerereAprovizionare.update({
      where: { id },
      data: {
        ...data,
        valoare,
      }
    });

    const cerere = await prisma.cerereAprovizionare.update({
      where: { id_cerere: data.id_cerere },
      data: {
        valoare: {
          increment: valoare - Number(linieVechi?.valoare),
        },
      },
    });

    if (cerere.status === "APROBATA") {
      const diferenta = data.cantitate - Number(linieVechi?.cantitate);

      await prisma.bun.update({
        where: { id_bun: data.id_bun },
        data: { cantitate_disponibila: { increment: diferenta } }
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: data.id_bun,
          id_gestiune: cerere.id_gestiune
        },
        data: {
          stoc_actual: { increment: diferenta }
        },
      });
    }

    return linieNoua;
  }

  static async deleteFromDB(prisma: any, id: number): Promise<void> {
    const linie = await prisma.linieCerereAprovizionare.findUnique({ where: { id } });
    if (!linie) throw new Error("Linie inexistentă");

    const cerere = await prisma.cerereAprovizionare.update({
      where: { id_cerere: linie.id_cerere },
      data: {
        valoare: { decrement: Number(linie.valoare) }
      }
    });

    if (cerere.status === "APROBATA") {
      await prisma.bun.update({
        where: { id_bun: linie.id_bun },
        data: {
          cantitate_disponibila: { decrement: Number(linie.cantitate) }
        },
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: linie.id_bun,
          id_gestiune: cerere.id_gestiune
        },
        data: {
          stoc_actual: { decrement: Number(linie.cantitate) }
        }
      });
    }

    await prisma.linieCerereAprovizionare.delete({ where: { id } });
  }



}
