import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { id_cerere_aprovizionare, data: dataReceptie, linii_receptie } = data

    // Verificare cerere aprovizionare
    if (id_cerere_aprovizionare) {
      const cerereAprovizionare = await prisma.cerereAprovizionare.findUnique({
        where: { nr_document: id_cerere_aprovizionare },
      })

      if (!cerereAprovizionare) {
        return NextResponse.json({ error: "Cererea de aprovizionare nu există" }, { status: 404 })
      }

      // Corectare: Folosim valoarea corectă din enum StatusCerere
      if (cerereAprovizionare.status !== "APROBATA") {
        return NextResponse.json({ error: "Cererea de aprovizionare nu este aprobată" }, { status: 400 })
      }
    }

    // Creare document
    const document = await prisma.document.create({
      data: { data: new Date(dataReceptie) },
    })

    // Calculare valoare totală
    let valoareTotala = 0
    for (const linie of linii_receptie) {
      valoareTotala += Number(linie.cantitate_receptionata) * Number(linie.pret)
    }

    // Creare recepție - eliminăm câmpul validat care nu există în schema
    const receptie = await prisma.receptie.create({
      data: {
        nr_document: document.nr_document,
        data: new Date(dataReceptie),
        valoare_totala: valoareTotala,
        // Eliminat câmpul validat care nu există în schema
      },
    })

    // Creare linii recepție
    const liniiCreate = []
    for (const linie of linii_receptie) {
      const linieCreata = await prisma.linie_receptie.create({
        data: {
          id_receptie: receptie.nr_document,
          id_bun: linie.id_bun,
          cantitate_receptionata: linie.cantitate_receptionata,
          pret: linie.pret,
          status: linie.status || "RECEPTIONATA", // Folosim valoarea corectă pentru status
        },
      })
      liniiCreate.push(linieCreata)
    }

    // Actualizăm stocurile
    if (id_cerere_aprovizionare) {
      // Obținem cererea de aprovizionare pentru a afla gestiunea
      const cerere = await prisma.cerereAprovizionare.findUnique({
        where: { nr_document: id_cerere_aprovizionare },
      })

      if (cerere) {
        // Actualizăm stocurile pentru fiecare linie
        for (const linie of linii_receptie) {
          // Actualizăm cantitatea disponibilă a bunului
          await prisma.bun.update({
            where: { id_bun: linie.id_bun },
            data: {
              cantitate_disponibila: {
                increment: Number(linie.cantitate_receptionata),
              },
            },
          })

          // Verificăm dacă există stoc pentru acest bun în gestiunea respectivă
          const stocExistent = await prisma.stoc.findFirst({
            where: {
              id_bun: linie.id_bun,
              id_gestiune: cerere.id_gestiune,
            },
          })

          if (stocExistent) {
            // Actualizăm stocul existent
            await prisma.stoc.update({
              where: { id_stoc: stocExistent.id_stoc },
              data: {
                stoc_actual: {
                  increment: Number(linie.cantitate_receptionata),
                },
              },
            })
          } else {
            // Creăm un stoc nou
            await prisma.stoc.create({
              data: {
                id_bun: linie.id_bun,
                id_gestiune: cerere.id_gestiune,
                stoc_init_lunar: Number(linie.cantitate_receptionata),
                stoc_actual: Number(linie.cantitate_receptionata),
                prag_minim: 0,
                cantitate_optima: 0,
              },
            })
          }
        }

        // Actualizăm statusul cererii de aprovizionare
        await prisma.cerereAprovizionare.update({
          where: { nr_document: id_cerere_aprovizionare },
          data: { status: "FINALIZATA" }, // Corectare: Folosim valoarea corectă din enum StatusCerere
        })
      }
    }

    return NextResponse.json({
      receptie: {
        id_receptie: receptie.nr_document,
        data: receptie.data,
        valoare_totala: valoareTotala,
      },
      linii_receptie: liniiCreate,
    })
  } catch (error) {
    console.error("Eroare la crearea recepției:", error)
    return NextResponse.json({ error: "Eroare la crearea recepției" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Obținere recepție specifică
      const receptie = await prisma.receptie.findUnique({
        where: { nr_document: Number.parseInt(id) },
        include: {
          document: true,
          linii_receptie: {
            include: {
              bun: true,
            },
          },
        },
      })

      if (!receptie) {
        return NextResponse.json({ error: "Recepția nu a fost găsită" }, { status: 404 })
      }

      return NextResponse.json(receptie)
    } else {
      // Obținere toate recepțiile
      const receptii = await prisma.receptie.findMany({
        include: {
          document: true,
        },
        orderBy: {
          data: "desc",
        },
      })

      return NextResponse.json(receptii)
    }
  } catch (error) {
    console.error("Eroare la obținerea recepțiilor:", error)
    return NextResponse.json({ error: "Eroare la obținerea recepțiilor" }, { status: 500 })
  }
}
