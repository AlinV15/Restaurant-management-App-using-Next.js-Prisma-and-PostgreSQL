// lib/classes/Consum.ts

import { NextResponse } from "next/server";
import { LinieConsum } from "./LinieConsum";
import { Angajat } from "./Angajat";
import { Gestiune } from "./Gestiune";

export abstract class Document {

  constructor(
    private nr_document: number,
    private data: Date
  ) { }

  public getId() {
    return this.nr_document
  }

  public getData() {
    return this.data
  }

  public setData(data: Date) {
    this.data = data
  }

  abstract tipDocument(): string;
}

export class Consum extends Document {
  private sef!: Angajat
  private gestiune!: Gestiune

  constructor(
    nr_document: number,
    data: Date,
    private valoare: number,
    private id_sef: number | null,
    private id_gestiune: number,
    public linii: LinieConsum[] = []
  ) {
    super(nr_document, data);
  }

  //getteri
  public getValoare() {
    return this.valoare
  }

  public getIdSef() {
    return this.id_sef
  }

  public getIdGesiune() {
    return this.id_gestiune
  }

  getSef() {
    return this.sef;
  }

  getGestiune() {
    return this.gestiune
  }

  //setteri
  public setValoare(val: number) {
    this.valoare = val
  }

  public setIdSef(sef: number) {
    this.id_sef = sef
  }

  public setIdGestiune(gestiune: number) {
    this.id_gestiune = gestiune
  }

  setSef(sef: Angajat) {
    this.sef = sef
  }

  setGestiune(gestiune: Gestiune) {
    this.gestiune = gestiune
  }
  // alte metode utile

  tipDocument(): string {
    return "Consum";
  }

  totalCantitati(): number {
    return this.linii.reduce((acc, linie) => acc + Number(linie.getCantitateEliberata()), 0);
  }

  static placeholder(id: number): Consum {
    return new Consum(id, new Date(), 0, 0, 0);
  }

  getTotal(): number {
    return this.valoare;
  }

  toJson(): any {
    return {
      nr_document: this.getId(),
      valoare: this.valoare,
      data: this.getData().toISOString(),
      id_sef: this.id_sef,
      id_gestiune: this.id_gestiune,
      linii: this.linii.map(l => l.toJson()),
      gestiune: this.gestiune.toJson(),
      sef: this.sef.toJson()
    };
  }

  static fromApi(data: any): Consum {
    return new Consum(
      data.nr_document,
      new Date(data.data),
      Number(data.valoare),
      data.id_sef ?? null,
      data.id_gestiune,
      data.linii ? data.linii.map((l: any) => LinieConsum.fromApi(l)) : []
    );
  }

  static fromPrisma(data: any): Consum {
    const cns = new Consum(
      data.nr_document,
      new Date(data.data),
      Number(data.valoare),
      data.id_sef ?? null,
      data.id_gestiune,
      data.liniiConsum ? data.liniiConsum.map((lc: any) => LinieConsum.fromPrisma(lc)) : []
    );

    cns.setGestiune(Gestiune.fromPrisma(data.gestiune))
    cns.setSef(Angajat.fromPrisma(data.sef))

    return cns;
  }


  static async stergeDinDB(prisma: any, id: string) {
    const consumVechi = await prisma.consum.findUnique({
      where: { nr_document: parseInt(id) },
    });

    if (!consumVechi) {
      return NextResponse.json({ error: "Consum not found" }, { status: 404 });
    }

    const liniiConsum = await prisma.linieConsum.findMany({
      where: { id_consum: parseInt(id) }
    })

    if (liniiConsum.length > 0) {

      for (const linie of liniiConsum) {
        const id_bun = linie.id_bun;

        await prisma.linieConsum.delete({
          where: { id_linie_consum: linie.id_linie_consum }
        })

        await prisma.bun.update({
          where: { id_bun: id_bun },
          data: {
            cantitate_disponibila: {
              increment: linie.cant_eliberata
            }
          }
        })

        await prisma.stoc.updateMany({
          where: {
            id_bun: id_bun,
            id_gestiune: consumVechi.id_gestiune
          },
          data: {
            stoc_actual: {
              increment: linie.cant_eliberata
            }
          }
        })
      }

    }

    const consum = await prisma.consum.delete({
      where: { nr_document: parseInt(id) },
    });


    await prisma.document.delete({
      where: { nr_document: parseInt(id) },
    });

    return consum
  }

  static async createFromInput(body: any, prisma: any) {

    const { id_sef, id_gestiune, data, linii } = body;

    if (!id_sef || !id_gestiune || !linii || !Array.isArray(linii) || linii.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Folosim o tranzacție pentru a asigura consistența datelor
    return await prisma.$transaction(async (tx: any) => {
      // 1. Creăm documentul

      const doc = await tx.document.create({
        data: {
          data: new Date()
        }
      });

      // 2. Calculăm valoarea totală inițială (va fi actualizată pe măsură ce procesăm liniile)
      let valoareTotala = 0;

      // 3. Creăm consumul principal
      const consum = await tx.consum.create({
        data: {
          nr_document: doc.nr_document,
          valoare: valoareTotala,
          id_sef: Number(id_sef),
          id_gestiune: Number(id_gestiune),
          data: new Date()
        }
      });

      // 4. Procesăm fiecare linie de consum
      const liniiCreated = [];
      const cereriAprovizionare = new Map(); // Pentru a ține evidența cererii de aprovizionare pentru fiecare gestiune

      for (const linie of linii) {
        const { id_bun, cantitate_necesara, cant_eliberata } = linie;

        if (!id_bun || !cantitate_necesara || !cant_eliberata) {
          throw new Error(`Linia de consum pentru bunul ${id_bun} are câmpuri lipsă`);
        }

        // Verificăm bunul
        const bun = await tx.bun.findUnique({
          where: {
            id_bun: Number(id_bun)
          }
        });

        if (!bun) {
          throw new Error(`Bunul cu ID-ul ${id_bun} nu a fost găsit`);
        }

        // Verificăm stocul
        const stoc = await tx.stoc.findFirst({
          where: {
            id_bun: Number(id_bun),
            id_gestiune: consum.id_gestiune
          }
        });

        if (!stoc) {
          throw new Error(`Nu există bunul înregistrat în stoc pentru gestiunea specificată`);
        }

        // Verificăm disponibilitatea cantității
        if (cant_eliberata > Number(bun.cantitate_disponibila)) {
          // În loc să facem cerere HTTP, operăm direct în tranzacție
          let cerereId;

          // Verificăm dacă avem deja o cerere de aprovizionare pentru această gestiune
          if (!cereriAprovizionare.has(consum.id_gestiune)) {
            // Creăm cererea de aprovizionare
            // Adăugăm toate câmpurile obligatorii conform schemei
            const documentCerere = await tx.document.create({
              data: {
                data: new Date()
              }
            });

            const cerereNoua = await tx.cerereAprovizionare.create({
              data: {
                nr_document: documentCerere.nr_document, // Folosim nr_document ca id_cerere
                id_gestiune: consum.id_gestiune,
                data: new Date(),
                valoare: 0, // Valoare inițială, va fi actualizată după adăugarea liniilor
              }
            });
            cerereId = cerereNoua.nr_document;
            cereriAprovizionare.set(consum.id_gestiune, cerereId);
          } else {
            cerereId = cereriAprovizionare.get(consum.id_gestiune);
          }

          // Cantitatea necesară pentru aprovizionare
          const cantitateNecesara = stoc.cantitate_optima || (cant_eliberata - Number(bun.cantitate_disponibila)) * 2;

          // Calculăm valoarea pentru linia cererii
          const valoareLinieCerere = Number(bun.pret_unitar) * Number(cantitateNecesara);

          // Creăm linia cererii
          await tx.linieCerereAprovizionare.create({
            data: {
              id_cerere: cerereId,
              id_bun: bun.id_bun,
              cantitate: cantitateNecesara,
              valoare: valoareLinieCerere, // Adăugăm valoarea conform schemei
              observatii: "Cerere de aprovizionare automată"
            }
          });

          // Actualizăm valoarea totală a cererii
          await tx.cerereAprovizionare.update({
            where: {
              nr_document: cerereId
            },
            data: {
              valoare: {
                increment: valoareLinieCerere
              }
            }
          });

          throw new Error(`Cantitate insuficientă pentru bunul ${bun.nume_bun}. Cerere de aprovizionare a fost creată.`);
        }

        // Actualizăm stocul bunului
        await tx.bun.update({
          where: {
            id_bun: Number(id_bun)
          },
          data: {
            cantitate_disponibila: {
              decrement: cant_eliberata
            }
          }
        });

        // Actualizăm stocul din gestiune
        await tx.stoc.updateMany({
          where: {
            id_bun: Number(id_bun),
            id_gestiune: consum.id_gestiune
          },
          data: {
            stoc_actual: {
              decrement: cant_eliberata
            }
          }
        });

        // Calculăm valoarea liniei
        const valoareLinie = Number(bun.pret_unitar) * Number(cant_eliberata);
        valoareTotala += valoareLinie;

        // Creăm linia de consum
        const linieConsum = await tx.linieConsum.create({
          data: {
            id_bun: Number(id_bun),
            id_consum: consum.nr_document,
            cantitate_necesara: Number(cantitate_necesara),
            cant_eliberata: Number(cant_eliberata),
            valoare: valoareLinie
          }
        });

        liniiCreated.push(linieConsum);


      }

      // 5. Actualizăm valoarea totală a consumului
      const consumActualizat = await tx.consum.update({
        where: {
          nr_document: consum.nr_document
        },
        data: {
          valoare: valoareTotala
        }
      });

      const consumObj = Consum.fromPrisma(consumActualizat)
      const liniiConsumObj = liniiCreated.map(LinieConsum.fromPrisma)

      // 6. Returnăm consumul și liniile create
      return NextResponse.json({
        consum: consumObj,
        linii: liniiConsumObj
      }, { status: 201 });
    })
  }

  static async actualizeazaInDB(prisma: any, body: any, id: string) {
    const { id_sef, id_gestiune, data, linii } = body;

    if (!id_sef || !id_gestiune || !linii || !data || !Array.isArray(linii) || linii.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    return await prisma.$transaction(async (tx: any) => {
      const consum = await tx.consum.findUnique({
        where: { nr_document: Number(id) }
      });

      if (!consum) {
        return NextResponse.json({ error: "Consum not found" }, { status: 404 });
      }

      let valoareTotala = 0;

      const liniiExistente = await tx.linieConsum.findMany({
        where: { id_consum: Number(id) }
      });

      for (const linie of liniiExistente) {
        await tx.bun.update({
          where: { id_bun: linie.id_bun },
          data: { cantitate_disponibila: { increment: linie.cant_eliberata } }
        });

        await tx.stoc.updateMany({
          where: { id_bun: linie.id_bun, id_gestiune: consum.id_gestiune },
          data: { stoc_actual: { increment: linie.cant_eliberata } }
        });
      }

      await tx.linieConsum.deleteMany({
        where: { id_consum: Number(id) }
      });

      const liniiCreated = [];
      const cereriAprovizionare = new Map();

      for (const linie of linii) {
        const { id_bun, cantitate_necesara, cant_eliberata } = linie;

        if (!id_bun || !cantitate_necesara || !cant_eliberata) {
          throw new Error(`Linia de consum pentru bunul ${id_bun} are câmpuri lipsă`);
        }

        const bun = await tx.bun.findUnique({
          where: { id_bun: Number(id_bun) }
        });

        if (!bun) {
          throw new Error(`Bunul cu ID-ul ${id_bun} nu a fost găsit`);
        }

        const stoc = await tx.stoc.findFirst({
          where: { id_bun: Number(id_bun), id_gestiune: Number(id_gestiune) }
        });

        if (!stoc) {
          throw new Error(`Nu există bunul înregistrat în stoc pentru gestiunea specificată`);
        }

        if (cant_eliberata > Number(bun.cantitate_disponibila)) {
          let cerereId;

          if (!cereriAprovizionare.has(Number(id_gestiune))) {
            const documentCerere = await tx.document.create({
              data: { data: new Date() }
            });

            const cerereNoua = await tx.cerereAprovizionare.create({
              data: {
                nr_document: documentCerere.nr_document,
                id_gestiune: Number(id_gestiune),
                data: new Date(),
                valoare: 0,
              }
            });

            cerereId = cerereNoua.nr_document;
            cereriAprovizionare.set(Number(id_gestiune), cerereId);
          } else {
            cerereId = cereriAprovizionare.get(Number(id_gestiune));
          }

          const cantitateNecesara = stoc.cantitate_optima || (cant_eliberata - Number(bun.cantitate_disponibila)) * 2;
          const valoareLinieCerere = Number(bun.pret_unitar) * Number(cantitateNecesara);

          await tx.linieCerereAprovizionare.create({
            data: {
              id_cerere: cerereId,
              id_bun: bun.id_bun,
              cantitate: cantitateNecesara,
              valoare: valoareLinieCerere,
              observatii: "Cerere de aprovizionare automată"
            }
          });

          await tx.cerereAprovizionare.update({
            where: { nr_document: cerereId },
            data: { valoare: { increment: valoareLinieCerere } }
          });

          throw new Error(`Cantitate insuficientă pentru bunul ${bun.nume_bun}. Cerere de aprovizionare a fost creată.`);
        }

        await tx.bun.update({
          where: { id_bun: Number(id_bun) },
          data: { cantitate_disponibila: { decrement: cant_eliberata } }
        });

        await tx.stoc.updateMany({
          where: { id_bun: Number(id_bun), id_gestiune: Number(id_gestiune) },
          data: { stoc_actual: { decrement: cant_eliberata } }
        });

        const valoareLinie = Number(bun.pret_unitar) * Number(cant_eliberata);
        valoareTotala += valoareLinie;

        const linieConsum = await tx.linieConsum.create({
          data: {
            id_bun: Number(id_bun),
            id_consum: Number(id),
            cantitate_necesara: Number(cantitate_necesara),
            cant_eliberata: Number(cant_eliberata),
            valoare: valoareLinie
          },
          include: { bun: true }
        });

        liniiCreated.push(linieConsum);
      }

      const consumActualizat = await tx.consum.update({
        where: { nr_document: Number(id) },
        data: {
          valoare: valoareTotala,
          id_sef: Number(id_sef),
          id_gestiune: Number(id_gestiune),
          data: data ? new Date(data) : new Date()
        }
      });

      return NextResponse.json({
        consum: Consum.fromPrisma(consumActualizat),
        linii: LinieConsum.fromPrisma(liniiCreated),
        message: "Consum actualizat cu succes"
      }, { status: 200 });
    });
  }
}