
import { LinieConsum } from "@/lib/classes/LinieConsum";
import { Bun } from "@/lib/classes/Bun";
import prisma from '@/lib/prisma';

export class LinieConsumExtinsa extends LinieConsum {
  bun: Bun;

  constructor(
    id_linie_consum: number,
    id_consum: number,
    id_bun: number,
    cantitate_necesara: number,
    cant_eliberata: number,
    valoare: number,
    bun: Bun
  ) {
    super(id_linie_consum, id_consum, id_bun, cantitate_necesara, cant_eliberata, valoare);
    this.bun = bun;
  }

  async getBunById(id_bun: number): Promise<Bun | undefined> {
    const bun = await prisma.bun.findUnique({
      where: {
        id_bun: id_bun,
      },
    });
    if (!bun?.data_expirare) return;

    if (bun) {
      this.bun = new Bun(bun.id_bun, bun.nume_bun, Number(bun.cantitate_disponibila), Number(bun.pret_unitar), bun.unitate_masura, bun.data_expirare);
    } else {
      throw new Error(`Bun cu id ${id_bun} nu a fost găsit.`);
    }

    return this.bun;
  }
}
