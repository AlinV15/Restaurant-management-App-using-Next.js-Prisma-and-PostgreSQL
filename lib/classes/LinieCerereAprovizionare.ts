import { NextResponse } from "next/server"
import { Bun } from "./Bun"

export class LinieCerereAprovizionare {
  private bun!: Bun;
  constructor(
    private id: number,
    private id_cerere: number,
    private id_bun: number,
    private cantitate: number,
    private valoare: number,
    private observatii?: string
  ) { }

  //getteri
  public getID() {
    return this.id
  }

  public getIdCerere() {
    return this.id_cerere
  }

  public getIdBun() {
    return this.id_bun
  }

  public getCantitate() {
    return this.cantitate
  }

  getValoare() {
    return this.valoare
  }

  getBun() {
    return this.bun
  }

  getObservatii() {
    return this.observatii
  }

  //setteri
  setCantitate(qty: number) {
    this.cantitate = qty
  }

  setValoare(val: number) {
    this.valoare = val
  }

  setBun(b: Bun) {
    this.bun = b
  }

  setObservatii(obs: string) {
    this.observatii = obs
  }

  // alte metode

  static fromPrisma(data: any): LinieCerereAprovizionare {
    const ln = new LinieCerereAprovizionare(
      data.id,
      data.id_cerere,
      data.id_bun,
      Number(data.cantitate),
      Number(data.valoare),
      data.observatii ?? undefined
    );

    ln.bun = data.bun ?? null
    return ln
  }

  static async createInDB(prisma: any, data: any): Promise<any> {
    const { id_cerere, id_bun, cantitate, observatii } = data;

    if (!id_cerere || !id_bun || !cantitate || !observatii) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bun = await prisma.bun.findUnique({
      where: {
        id_bun: id_bun,
      },
    });
    if (!bun) {
      return NextResponse.json({ error: "Bun not found" }, { status: 404 });
    }

    const valoare = Number(bun.pret_unitar) * cantitate;

    const newLinieCerereAprovizionare = await prisma.linieCerereAprovizionare.create({
      data: {
        id_cerere,
        id_bun,
        cantitate,
        valoare,
        observatii,
      },
    });

    const cerere = await prisma.cerereAprovizionare.update({
      where: {
        nr_document: id_cerere,
      },
      data: {
        valoare: {
          increment: valoare,
        }
      }
    });

    if (!cerere) {
      return NextResponse.json({ error: "Cerere not found" }, { status: 404 });
    }

    if (cerere.status === "APROBATA") {
      await prisma.bun.update({
        where: {
          id_bun: id_bun,

        },
        data: {
          cantitate_disponibila: {
            increment: cantitate,
          },
        },
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: id_bun,
          id_gestiune: cerere.id_gestiune,
        },
        data: {
          stoc_actual: {
            increment: cantitate,
          },
        },
      });
    }

    return newLinieCerereAprovizionare;
  }


  static async updateInDB(prisma: any, id: string, data: any): Promise<any> {
    const { id_cerere, id_bun, cantitate, observatii } = data;

    if (!id_cerere || !id_bun || !cantitate || !observatii) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bun = await prisma.bun.findUnique({
      where: {
        id_bun: id_bun,
      },
    });
    if (!bun) {
      return NextResponse.json({ error: "Bun not found" }, { status: 404 });
    }

    const valoare = Number(bun.pret_unitar) * cantitate;

    const linieAprovVeche = await prisma.linieCerereAprovizionare.findUnique({
      where: {
        id: Number(id),
      },
    });




    const updatedLinieCerereAprovizionare = await prisma.linieCerereAprovizionare.update({
      where: { id: Number(id) },
      data: {
        id_cerere,
        id_bun,
        cantitate,
        valoare,
        observatii,
      },
    });

    const cerere = await prisma.cerereAprovizionare.update({
      where: {
        nr_document: id_cerere,
      },
      data: {
        valoare: {
          increment: valoare - Number(linieAprovVeche?.valoare),
        },
      },
    });

    if (cerere.status === "APROBATA") {
      await prisma.bun.update({
        where: {
          id_bun: id_bun,
        },
        data: {
          cantitate_disponibila: {
            increment: cantitate - Number(linieAprovVeche?.cantitate),
          },
        },
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: id_bun,
          id_gestiune: cerere.id_gestiune,
        },
        data: {
          stoc_actual: {
            increment: cantitate - Number(linieAprovVeche?.cantitate),
          },
        },
      });
    }
    return updatedLinieCerereAprovizionare;
  }

  static async deleteFromDB(prisma: any, id: string) {
    const linieCerereAprovizionare = await prisma.linieCerereAprovizionare.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!linieCerereAprovizionare) {
      return NextResponse.json({ error: "Linie Cerere Aprovizionare not found" }, { status: 404 });
    }

    const cerere = await prisma.cerereAprovizionare.update({
      where: {
        nr_document: linieCerereAprovizionare.id_cerere,
      },
      data: {
        valoare: {
          decrement: Number(linieCerereAprovizionare.valoare),
        },
      },
    });

    if (cerere.status === "APROBATA") {
      await prisma.bun.update({
        where: {
          id_bun: linieCerereAprovizionare.id_bun,
        },
        data: {
          cantitate_disponibila: {
            decrement: Number(linieCerereAprovizionare.cantitate),
          },
        },
      });

      await prisma.stoc.updateMany({
        where: {
          id_bun: linieCerereAprovizionare.id_bun,
          id_gestiune: cerere.id_gestiune,
        },
        data: {
          stoc_actual: {
            decrement: Number(linieCerereAprovizionare.cantitate),
          },
        },
      });
    }

    await prisma.linieCerereAprovizionare.delete({
      where: { id: Number(id) },
    });
  }



}
