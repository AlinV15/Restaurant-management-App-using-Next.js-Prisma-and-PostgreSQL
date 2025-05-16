
import { Document } from "./Consum";
import { LinieCerereAprovizionare } from "./LinieCerereAprovizionare";
//import prisma from "../prisma";
import { NextResponse } from "next/server";
import { mapToPrismaStatus } from "@/app/utils/statusMapper";

export enum StatusCerere {
  IN_ASTEPTARE = "în așteptare",
  APROBATA = "aprobată",
  RESPINSA = "respinsă",
  FINALIZATA = "finalizată"
}

export class CerereAprovizionare extends Document {
  constructor(
    nr_document: number,
    data: Date,
    private id_gestiune: number,
    private valoare: number,
    private status: StatusCerere = StatusCerere.IN_ASTEPTARE,
    public linii: LinieCerereAprovizionare[] = []
  ) {
    super(nr_document, data);
  }

  //getteri 
  public getIdGestiune() {
    return this.id_gestiune
  }

  public getValoare() {
    return this.valoare
  }

  public getStatus() {
    return mapToPrismaStatus(this.status)
  }

  //setteri
  public setStatus(status: StatusCerere) {
    this.status = status
  }

  public setValoare(val: number) {
    this.valoare = val
  }



  tipDocument(): string {
    return "CerereAprovizionare";
  }

  static fromPrisma(data: any): CerereAprovizionare {
    return new CerereAprovizionare(
      data.id_cerere,
      new Date(data.data),
      data.id_gestiune,
      Number(data.valoare),
      data.status,
      data.liniiCerere ? data.liniiCerere.map((lc: any) => LinieCerereAprovizionare.fromPrisma(lc)) : []
    );
  }

  static async createFromInput(body: any, prisma: any) {
    const { id_gestiune } = body;

    console.log(id_gestiune);

    if (!id_gestiune) {
      return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
    }

    const valoare = 0;
    const doc = await prisma.document.create({
      data: {
        data: new Date(),
      }
    })

    const cerereAprov = await prisma.cerereAprovizionare.create({
      data: {
        nr_document: doc.nr_document,
        id_gestiune,
        status: StatusCerere.IN_ASTEPTARE,
        data: new Date(),
        valoare
      }
    });
    return cerereAprov
  }

  static async updateStatusCerere(body: any, id: string, prisma: any): Promise<any> {
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Date lipsa" }, { status: 400 });
    }

    if (status === "APROBATA") {
      const cerere = await prisma.cerereAprovizionare.findUnique({
        where: {
          nr_document: Number(id),
        },
      });

      if (!cerere) {
        return NextResponse.json({ error: "Cerere nu exista" }, { status: 404 });
      }

      const liniiCerere = await prisma.linieCerereAprovizionare.findMany({
        where: {
          id_cerere: Number(id),
        },
      });

      for (const linie of liniiCerere) {
        await prisma.bun.update({
          where: {
            id_bun: linie.id_bun,
          },
          data: {
            cantitate_disponibila: {
              increment: linie.cantitate,
            },
          },
        });

        await prisma.stoc.updateMany({
          where: {
            id_bun: linie.id_bun,
            id_gestiune: cerere.id_gestiune,
          },
          data: {
            stoc_actual: {
              increment: linie.cantitate,
            },
          }
        })

      }
    }

    const cerereAprov = await prisma.cerereAprovizionare.update({
      where: {
        nr_document: Number(id),
      },
      data: {
        status,
      },
    });

    return cerereAprov
  }

  static async stergere(id: string, prisma: any) {

    const cerereAprov = await prisma.cerereAprovizionare.findUnique({
      where: {
        nr_document: Number(id),
      },
    });

    if (!cerereAprov) {
      return NextResponse.json({ error: "Cerere nu exista" }, { status: 404 });
    }
    const liniiCerere = await prisma.linieCerereAprovizionare.findMany({
      where: {
        id_cerere: Number(id),
      },
    });
    for (const linie of liniiCerere) {
      if (cerereAprov.status === "APROBATA") {
        await prisma.bun.update({
          where: {
            id_bun: linie.id_bun,
          },
          data: {
            cantitate_disponibila: {
              decrement: linie.cantitate,
            },
          },
        });

        await prisma.stoc.updateMany({
          where: {
            id_bun: linie.id_bun,
            id_gestiune: cerereAprov.id_gestiune,
          },
          data: {
            stoc_actual: {
              decrement: linie.cantitate,
            },
          },
        });
      }
      await prisma.linieCerereAprovizionare.delete({
        where: {
          id: linie.id,
        },
      });
    }


    await prisma.cerereAprovizionare.delete({
      where: {
        nr_document: Number(id),
      },
    });

    await prisma.document.delete({
      where: {
        nr_document: Number(id),
      },
    })

  }
}
