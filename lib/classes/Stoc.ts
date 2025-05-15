export class Stoc {
  constructor(
    public id_stoc: number,
    public id_bun: number,
    public id_gestiune: number,
    public stoc_init_lunar?: number,
    public stoc_actual?: number,
    public prag_minim?: number,
    public cantitate_optima?: number
  ) { }

  esteSubPrag(): boolean {
    if (this.stoc_actual === undefined || this.prag_minim === undefined) return false;
    return this.stoc_actual < this.prag_minim;
  }

  static fromPrisma(data: any): Stoc {
    return new Stoc(
      data.id_stoc,
      data.id_bun,
      data.id_gestiune,
      data.stoc_init_lunar ? Number(data.stoc_init_lunar) : undefined,
      data.stoc_actual ? Number(data.stoc_actual) : undefined,
      data.prag_minim ? Number(data.prag_minim) : undefined,
      data.cantitate_optima ? Number(data.cantitate_optima) : undefined
    );
  }

  static async createInDB(prisma: any, body: any): Promise<Stoc> {
    const { id_bun, id_gestiune, stoc_init_lunar, prag_minim, cantitate_optima } = body;

    const bun = await prisma.bun.findUnique({ where: { id_bun } });
    if (!bun) throw new Error("Bun not found");

    const duplicate = await prisma.stoc.findFirst({
      where: { id_bun, id_gestiune }
    });
    if (duplicate) throw new Error("Stoc already exists for this bun and gestiune");

    const created = await prisma.stoc.create({
      data: {
        id_bun,
        id_gestiune,
        stoc_init_lunar,
        stoc_actual: bun.cantitate_disponibila,
        prag_minim,
        cantitate_optima,
      }
    });

    return Stoc.fromPrisma(created);
  }


  static async updateInDB(prisma: any, id: number, body: any): Promise<Stoc> {
    const updated = await prisma.stoc.update({
      where: { id_stoc: id },
      data: {
        id_bun: body.id_bun,
        id_gestiune: body.id_gestiune,
        stoc_init_lunar: body.stoc_init_lunar,
        prag_minim: body.prag_minim,
        cantitate_optima: body.cantitate_optima,
      },
    });

    return Stoc.fromPrisma(updated);
  }

  static async deleteFromDB(prisma: any, id: number): Promise<Stoc> {
    const deleted = await prisma.stoc.delete({ where: { id_stoc: id } });
    return Stoc.fromPrisma(deleted);
  }
}
