import { NextResponse } from "next/server";
import { Bun } from "./Bun";

export class LinieConsum {
  private bun!: any;
  constructor(
    private id_linie_consum: number,
    private id_consum: number,
    private id_bun: number,
    private cantitate_necesara: number,
    private valoare: number,
    private cant_eliberata: number
  ) { }

  //getteri
  getId() {
    return this.id_linie_consum
  }

  getIdConsum() {
    return this.id_consum
  }
  getIdBun() {
    return this.id_bun
  }

  getCantitateNecesara() {
    return this.cantitate_necesara
  }

  getCantitateEliberata() {
    return this.cant_eliberata
  }
  getValoare() {
    return this.valoare
  }

  //setteri
  setCantitateNecesara(qtyNec: number) {
    this.cantitate_necesara = qtyNec
  }

  setCantitateEliberata(qtyElib: number) {
    this.cant_eliberata = qtyElib
  }
  setValoare(val: number) {
    this.valoare = val
  }

  // alte metode

  static fromPrisma(data: any): LinieConsum {
    const ln = new LinieConsum(
      data.id_linie_consum,
      data.id_consum,
      data.id_bun,
      Number(data.cantitate_necesara),
      Number(data.valoare),
      Number(data.cant_eliberata)
    );

    ln.bun = data.bun
    return ln;
  }

  toJson(): any {
    return {
      id_linie_consum: this.id_linie_consum,
      id_consum: this.id_consum,
      id_bun: this.id_bun,
      cantitate_necesara: this.cantitate_necesara,
      cant_eliberata: this.cant_eliberata,
      valoare: this.valoare,
      bun: this.getBun() ?? null
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

    if (!id_bun || !id_consum || !cantitate_necesara || !cant_eliberata) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }



    const bun = await prisma.bun.findUnique({
      where: {
        id_bun: parseInt(id_bun)
      }
    });

    if (!bun) {
      return NextResponse.json({ error: "Bun not found" }, { status: 404 });
    }



    await prisma.bun.update({
      where: {
        id_bun: parseInt(id_bun)
      },
      data: {
        cantitate_disponibila: {
          decrement: cant_eliberata
        }
      }
    })
    const consum = await prisma.consum.findUnique({
      where: {
        nr_document: parseInt(id_consum)
      }
    })



    if (!consum) {
      return NextResponse.json({ error: "Consum not found" }, { status: 404 });
    }




    const stoc = await prisma.stoc.findFirst({
      where: {
        id_bun: parseInt(id_bun),
        id_gestiune: consum?.id_gestiune
      }
    })

    if (!stoc) {
      return NextResponse.json({ error: "Nu exista bunul inregistrat in stoc. Va rog sa inregistrati in stoc bunul." }, { status: 404 });
    }

    if (cant_eliberata > bun.cantitate_disponibila) {
      const gestiune = Number(consum.id_gestiune);
      const cerereResponse = await fetch("http://localhost:3000/api/cerere-aprovizionare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

          id_gestiune: gestiune

        })
      });

      if (!cerereResponse.ok) {
        console.error("Cererea de aprovizionare a eșuat:", await cerereResponse.text());
      }

      const responseObject = await cerereResponse.json();
      console.log(responseObject);

      const linieCerereResponse = await fetch("http://localhost:3000/api/linie-cerere-aprovizionare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_cerere: responseObject.id_cerere,
          id_bun: bun.id_bun,
          cantitate: stoc.cantitate_optima || (cant_eliberata - Number(bun.cantitate_disponibila)) * 2,
          observatii: "Cerere de aprovizionare automata"
        })
      });

      if (!linieCerereResponse.ok) {
        console.error("Crearea liniei cererii de aprovizionare a eșuat:", await linieCerereResponse.text());
      }


      return NextResponse.json({
        error: "Cantitate insuficienta. Cerere de aprovizionare a fost trimisa.",
        cerereId: responseObject.id_cerere,
        cantitateDisponibila: bun.cantitate_disponibila,
        cantitateNecesara: cant_eliberata
      }, { status: 400 });
    }

    await prisma.stoc.updateMany({
      where: {
        id_bun: parseInt(id_bun),
        id_gestiune: consum?.id_gestiune
      },
      data: {
        stoc_actual: {
          decrement: cant_eliberata
        }
      }
    })

    const val = Number(bun.pret_unitar) * cant_eliberata;

    const linieConsum = await prisma.linieConsum.create({
      data: {
        id_bun: parseInt(id_bun),
        id_consum: parseInt(id_consum),
        cantitate_necesara,
        cant_eliberata,
        valoare: val
      }
    });

    await prisma.consum.update({
      where: {
        nr_document: parseInt(id_consum)
      },
      data: {
        valoare: {
          increment: val
        }
      }
    });
    return NextResponse.json(LinieConsum.fromPrisma(linieConsum), { status: 201 });
  }


  static async updateInDB(prisma: any, id: string, data: any) {
    const { id_bun, id_consum, cantitate_necesara, cant_eliberata } = data;

    if (!id_bun || !id_consum || !cantitate_necesara || !cant_eliberata) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    const bun = await prisma.bun.findUnique({
      where: {
        id_bun: parseInt(id_bun)
      }
    });

    if (!bun) {
      return NextResponse.json({ error: "Bun not found" }, { status: 404 });
    }

    const val = Number(bun.pret_unitar) * cant_eliberata;



    const linieConsumVeche = await prisma.linieConsum.findUnique({
      where: {
        id_linie_consum: parseInt(id)
      }
    })

    await prisma.bun.update({
      where: {
        id_bun: parseInt(id_bun)
      },
      data: {
        cantitate_disponibila: {
          decrement: -cant_eliberata + Number(linieConsumVeche?.cant_eliberata)
        }
      }
    });

    const consum = await prisma.consum.findUnique({
      where: {
        nr_document: parseInt(id_consum)
      }
    })

    await prisma.stoc.updateMany({
      where: {
        id_bun: parseInt(id_bun),
        id_gestiune: consum?.id_gestiune
      },
      data: {
        stoc_actual: {
          increment: -cant_eliberata + Number(linieConsumVeche?.cant_eliberata)
        }
      }
    })

    const valoareInit = Number(linieConsumVeche?.valoare) || 0;

    console.log(valoareInit);

    const linieConsum = await prisma.linieConsum.update({
      where: {
        id_linie_consum: parseInt(id)
      },
      data: {
        id_bun: parseInt(id_bun),
        id_consum: parseInt(id_consum),
        cantitate_necesara,
        cant_eliberata,
        valoare: val
      }
    });



    await prisma.consum.update({
      where: {
        nr_document: parseInt(id_consum)
      },
      data: {
        valoare: {
          increment: Number(val - valoareInit)
        }
      }
    });

    return NextResponse.json(LinieConsum.fromPrisma(linieConsum), { status: 200 });
  }

  static async deleteFromDB(prisma: any, id: string) {
    const linieConsum = await prisma.linieConsum.findUnique({
      where: {
        id_linie_consum: parseInt(id)
      }
    });

    if (!linieConsum) {
      return NextResponse.json({ error: "Linie consum not found" }, { status: 404 });
    }

    const val = Number(linieConsum?.valoare) || 0;

    await prisma.linieConsum.delete({
      where: {
        id_linie_consum: parseInt(id)
      }
    });

    await prisma.consum.update({
      where: {
        nr_document: linieConsum.id_consum
      },
      data: {
        valoare: {
          decrement: Number(val)
        }
      }
    });

    await prisma.bun.update({
      where: {
        id_bun: linieConsum.id_bun
      },
      data: {
        cantitate_disponibila: {
          increment: Number(linieConsum.cant_eliberata)
        }
      }
    });

    const consum = await prisma.consum.findUnique({
      where: {
        nr_document: linieConsum.id_consum
      }
    })

    await prisma.stoc.updateMany({
      where: {
        id_bun: linieConsum.id_bun,
        id_gestiune: consum?.id_gestiune
      },
      data: {
        stoc_actual: {
          increment: linieConsum.cant_eliberata
        }
      }
    })


    return NextResponse.json({ message: "Linie consum deleted" }, { status: 200 });
  }


  diferenta(): number {
    return this.cantitate_necesara - this.cant_eliberata;
  }


  private getBun() {
    return this.bun
  }

  private setBun(bun: Bun) {
    this.bun = bun
  }

}
