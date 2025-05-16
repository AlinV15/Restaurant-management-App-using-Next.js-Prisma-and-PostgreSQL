// /app/lib/rapoarte/ConsumRaportBuilder.ts
import { Decimal } from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma";
import { Consum } from "@/lib/classes/Consum";
import { Gestiune } from "@/lib/classes/Gestiune";
import { LinieConsum } from "@/lib/classes/LinieConsum";
import { Bun } from "@/lib/classes/Bun";
import { RaportConsum } from "@/lib/classes/RaportConsum";

/**
 * Clasa responsabilă pentru construirea rapoartelor de consum
 */
export class ConsumRaportBuilder {
  private dataStart: string | null | undefined;
  private dataEnd: string | null | undefined;
  private gestiuni: number[];
  private bunuri: number[];

  /**
   * Constructor pentru builder-ul de rapoarte
   * @param filterOptions Opțiunile de filtrare pentru raport
   */
  constructor(filterOptions: {
    dataStart?: string | null | undefined;
    dataEnd?: string | null | undefined;
    gestiuni: number[];
    bunuri: number[];
  }) {
    this.dataStart = filterOptions.dataStart;
    this.dataEnd = filterOptions.dataEnd;
    this.gestiuni = filterOptions.gestiuni;
    this.bunuri = filterOptions.bunuri;
  }

  /**
   * Creează o instanță de ConsumRaportBuilder din parametrii URL
   * @param searchParams Parametrii din URL
   * @returns O instanță nouă de ConsumRaportBuilder
   */
  static fromSearchParams(searchParams: URLSearchParams): ConsumRaportBuilder {
    const dataStart = searchParams.get('dataStart');
    const dataEnd = searchParams.get('dataEnd');

    const gestiuniParam = searchParams.get('gestiuni');
    const gestiuni = gestiuniParam
      ? gestiuniParam.split(',').map(id => Number(id.trim())).filter(n => !isNaN(n))
      : [];

    const bunuriParam = searchParams.get('bunuri');
    const bunuri = bunuriParam
      ? bunuriParam.split(',').map(id => Number(id.trim())).filter(n => !isNaN(n))
      : [];

    return new ConsumRaportBuilder({ dataStart, dataEnd, gestiuni, bunuri });
  }

  /**
   * Construiește clauza where pentru filtrarea consumurilor
   * @returns Clauza where pentru query-ul Prisma
   */
  private buildWhereClause(): any {
    const whereClause: any = {
      document: {}
    };

    // Filtrare după interval de date
    if (this.dataStart || this.dataEnd) {
      whereClause.document.data = {};

      if (this.dataStart) {
        whereClause.document.data.gte = new Date(this.dataStart);
      }

      if (this.dataEnd) {
        // Setăm ora la sfârșitul zilei pentru a include toate înregistrările din ziua respectivă
        const endDate = new Date(this.dataEnd);
        endDate.setHours(23, 59, 59, 999);
        whereClause.document.data.lte = endDate;
      }
    }

    // Filtrare după gestiuni
    if (this.gestiuni.length > 0) {
      whereClause.id_gestiune = {
        in: this.gestiuni
      };
    }

    return whereClause;
  }

  /**
   * Construiește filtrul pentru bunuri
   * @returns Filtrul pentru bunuri pentru query-ul Prisma
   */
  private buildBunuriFilter(): any {
    if (this.bunuri.length > 0) {
      return {
        where: {
          id_bun: {
            in: this.bunuri
          }
        }
      };
    }
    return {};
  }

  /**
   * Obține consumurile din baza de date
   * @returns Consumurile filtrate
   */
  async fetchConsumuri(): Promise<any[]> {
    const whereClause = this.buildWhereClause();
    const bunuriFilter = this.buildBunuriFilter();

    return prisma.consum.findMany({
      where: whereClause,
      include: {
        document: true,
        gestiune: true,
        sef: true,
        liniiConsum: {
          include: { bun: true },
          ...bunuriFilter
        }
      },
      orderBy: {
        document: { data: 'desc' }
      }
    });
  }

  /**
   * Convertește rezultatele din Prisma în obiecte de domeniu
   * @param consumuriData Datele din Prisma
   * @returns Obiectele de domeniu
   */
  private mapToConsumuri(consumuriData: any[]): Consum[] {
    return consumuriData.map(consumData => {
      const liniiConsum = consumData.liniiConsum.map((linieData: any) => {
        const bunObj = new Bun(
          linieData.bun.id_bun,
          linieData.bun.nume_bun,
          Number(linieData.bun.pret_unitar),
          linieData.bun.unitate_masura || "-",
          linieData.bun.cantitate_disponibila
        );

        return new LinieConsum(
          linieData.id_linie_consum,
          linieData.id_consum,
          linieData.id_bun,
          linieData.cant_eliberata,
          Number(linieData.valoare),
          bunObj.getId()
        );
      });

      return new Consum(
        consumData.nr_document,
        consumData.id_gestiune,
        consumData.document.data,
        consumData.gestiune ? consumData.gestiune.denumire : `Gestiune #${consumData.id_gestiune}`,
        liniiConsum
      );
    });
  }

  /**
   * Construiește raportul de consum
   * @returns Raportul de consum generat
   */
  async build(): Promise<RaportConsum> {
    const consumuriData = await this.fetchConsumuri();

    // Ignorăm consumurile fără linii
    const consumuriValide = consumuriData.filter(consum => consum.liniiConsum.length > 0);

    // Convertim datele din Prisma în obiecte de domeniu
    const consumuri = this.mapToConsumuri(consumuriValide);

    // Grupăm după gestiune
    const gestiuniMap = new Map<number, Gestiune>();
    let totalGeneral = new Decimal(0);

    for (const consum of consumuri) {
      const totalConsum = consum.getTotal();
      totalGeneral = totalGeneral.add(new Decimal(totalConsum));

      const gestiuneKey = consum.getIdGesiune();

      if (!gestiuniMap.has(gestiuneKey)) {
        const gestiune = new Gestiune(gestiuneKey, consum.getGestiune().getDenumire(), consum.getIdSef());
        gestiuniMap.set(gestiuneKey, gestiune);
      }

      const gestiune = gestiuniMap.get(gestiuneKey);
      if (gestiune) {
        gestiune.adaugaConsum(consum);
      }
    }

    // Transformăm Map în array și construim raportul
    const gestiuni = Array.from(gestiuniMap.values());

    const raport = new RaportConsum(
      "Centralizatorul consumurilor pe gestiuni",
      this.formatPeriod(),
      gestiuni,
      Number(totalGeneral)
    );

    return raport;
  }

  /**
   * Formatează perioada raportului
   * @returns String formatat cu perioada raportului
   */
  private formatPeriod(): string {
    const startDate = this.dataStart
      ? new Date(this.dataStart).toLocaleDateString('ro-RO')
      : '';

    const endDate = this.dataEnd
      ? new Date(this.dataEnd).toLocaleDateString('ro-RO')
      : '';

    return `${startDate} - ${endDate}`;
  }
}