
import { Document } from "./Consum";
import { LinieCerereAprovizionare } from "./LinieCerereAprovizionare";
import prisma from "../prisma";
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
    public id_gestiune: number,
    public valoare: number,
    public status: StatusCerere = StatusCerere.IN_ASTEPTARE,
    public linii: LinieCerereAprovizionare[] = []
  ) {
    super(nr_document, data);
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
    const { id_gestiune, data, linii } = body;

    const document = await prisma.document.create({
      data: { data: new Date(data) || new Date() },
    });

    let valoareTotala = 0;

    const cerere = await prisma.cerereAprovizionare.create({
      data: {
        nr_document: document.nr_document,
        valoare: 0,
        status: StatusCerere.IN_ASTEPTARE,
        id_gestiune: Number(id_gestiune),
        data: new Date(data),
      },
    });

    const liniiCreate: any[] = [];

    for (const linie of linii) {
      const bun = await prisma.bun.findUnique({ where: { id_bun: linie.id_bun } });

      const valoareLinie = Number(bun.pret_unitar) * Number(linie.cant_eliberata);
      valoareTotala += valoareLinie;

      const linieCreata = await prisma.linieCerereAprovizionare.create({
        data: {
          id: linie.id_bun,
          id_cerere: cerere.nr_document,
          cantitate: linie.cantitate,
          valoare: valoareLinie,
          observatii: linie.observatii
        },
      });

      liniiCreate.push(linieCreata);
    }

    await prisma.cerereAprovizionare.update({
      where: { nr_document: cerere.nr_document },
      data: { valoare: valoareTotala },
    });

    return {
      nr_document: cerere.nr_document,
      valoare: valoareTotala,
      linii: liniiCreate,
    };
  }

  static async updateStatusCerere(body: any, id: number): Promise<any> {
    const cerere = await prisma.cerereAprovizionare.findUnique({
      where: {
        nr_document: id
      }

    })

    if (!cerere) {
      return NextResponse.json({ error: "Nu exista cerere!" }, { status: 404 })
    }


    if (cerere.status === mapToPrismaStatus(StatusCerere.IN_ASTEPTARE)) {
      cerere.status = mapToPrismaStatus(StatusCerere.APROBATA)
    }

    const linii = await prisma.linieCerereAprovizionare.findMany({
      where: {
        id_cerere: cerere.nr_document
      }
    })

    const bunuri = [];

    for (let linie of linii) {
      const bun = await prisma.bun.findUnique({
        where: {
          id_bun: linie.id_bun
        }
      })

      if (!bun) {
        return NextResponse.json({ error: "N-a fost identificat un bun in lista" }, { status: 404 })
      }
      await prisma.bun.update({
        where: {
          id_bun: bun.id_bun
        },
        data: {
          cantitate_disponibila: {
            increment: linie.cantitate
          }
        }
      })

      const stoc = await prisma.stoc.findFirst({

        where: {
          id_bun: bun.id_bun,
          id_gestiune: cerere.id_gestiune
        }
      })

      if (!stoc) {
        return NextResponse.json({ error: "N-a fost identificat un stoc" }, { status: 404 })
      }

      await prisma.stoc.update({
        where: {
          id_stoc: stoc.id_stoc
        },
        data: {
          stoc_actual: {
            increment: linie.cantitate
          }
        }
      })


    }

    return cerere;


  }

  static async updateCerere(body: any, id: number) {

  }
}
