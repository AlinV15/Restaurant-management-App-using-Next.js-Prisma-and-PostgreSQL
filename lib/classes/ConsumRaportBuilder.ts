
import { Decimal } from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma";

export class ConsumRaportBuilder {
  constructor(private searchParams: URLSearchParams) { }

  private parseFilters() {
    const dataStart = this.searchParams.get('dataStart');
    const dataEnd = this.searchParams.get('dataEnd');
    const gestiuniParam = this.searchParams.get('gestiuni');
    const bunuriParam = this.searchParams.get('bunuri');

    const gestiuni = gestiuniParam
      ? gestiuniParam.split(',').map(id => Number(id.trim())).filter(n => !isNaN(n))
      : [];

    const bunuri = bunuriParam
      ? bunuriParam.split(',').map(id => Number(id.trim())).filter(n => !isNaN(n))
      : [];

    const whereClause: any = {
      document: {}
    };

    if (dataStart || dataEnd) {
      whereClause.document.data = {};

      if (dataStart) {
        whereClause.document.data.gte = new Date(dataStart);
      }

      if (dataEnd) {
        const endDate = new Date(dataEnd);
        endDate.setHours(23, 59, 59, 999);
        whereClause.document.data.lte = endDate;
      }
    }

    if (gestiuni.length > 0) {
      whereClause.id_gestiune = { in: gestiuni };
    }

    return { whereClause, bunuri, dataStart, dataEnd };
  }

  async build() {
    const { whereClause, bunuri, dataStart, dataEnd } = this.parseFilters();

    const consumuri = await prisma.consum.findMany({
      where: whereClause,
      include: {
        document: true,
        gestiune: true,
        sef: true,
        liniiConsum: {
          include: { bun: true },
          ...(bunuri.length > 0
            ? { where: { id_bun: { in: bunuri } } }
            : {})
        }
      },
      orderBy: {
        document: { data: "desc" }
      }
    });

    const gestiuniMap = new Map();
    let totalGeneral = new Decimal(0);

    for (const consum of consumuri) {
      if (consum.liniiConsum.length === 0) continue;

      const totalConsum = consum.liniiConsum.reduce(
        (sum, linie) => sum.plus(linie.valoare),
        new Decimal(0)
      );

      totalGeneral = totalGeneral.plus(totalConsum);

      const gestiuneKey = consum.id_gestiune;
      const gestiuneNume = consum.gestiune?.denumire || `Gestiune #${gestiuneKey}`;

      if (!gestiuniMap.has(gestiuneKey)) {
        gestiuniMap.set(gestiuneKey, {
          id: gestiuneKey,
          nume: gestiuneNume,
          consumuri: [],
          total: new Decimal(0)
        });
      }

      const gestiuneData = gestiuniMap.get(gestiuneKey);

      const consumObj = {
        id_consum: consum.id_consum,
        data: consum.document.data,
        valoare: Number(totalConsum),
        liniiConsum: consum.liniiConsum.map(linie => ({
          id_linie_consum: linie.id_linie_consum,
          id_consum: linie.id_consum,
          id_bun: linie.id_bun,
          cantitate_necesara: linie.cant_eliberata,
          valoare: Number(linie.valoare),
          bun: {
            id_bun: linie.bun.id_bun,
            nume_bun: linie.bun.nume_bun,
            pret_unitar: Number(linie.bun.pret_unitar),
            unitate_masura: linie.bun.unitate_masura || "-",
            cantitate_disponibila: linie.bun.cantitate_disponibila
          }
        }))
      };

      gestiuneData.consumuri.push(consumObj);
      gestiuneData.total = gestiuneData.total.plus(totalConsum);
    }

    const gestiuniArray = Array.from(gestiuniMap.values()).map(gestiune => ({
      ...gestiune,
      total: Number(gestiune.total)
    }));

    return {
      title: "Centralizatorul consumurilor pe gestiuni",
      perioada: `${dataStart ? new Date(dataStart).toLocaleDateString("ro-RO") : ""} - ${dataEnd ? new Date(dataEnd).toLocaleDateString("ro-RO") : ""}`,
      gestiuni: gestiuniArray,
      totalGeneral: Number(totalGeneral)
    };
  }
}
