import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { Receptie } from "@/lib/classes/Receptie"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = Number.parseInt(context.params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 })
    }

    const receptie = await prisma.receptie.findUnique({
      where: { nr_document: id },
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

    return NextResponse.json(Receptie.fromPrisma(receptie))
  } catch (error) {
    console.error("Eroare la obținerea recepției:", error)
    return NextResponse.json({ error: "Eroare la obținerea recepției" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = Number.parseInt(context.params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 })
    }

    const data = await request.json()
    const { linii_receptie, validat } = data

    const receptieExistenta = await prisma.receptie.findUnique({
      where: { nr_document: id },
      include: {
        linii_receptie: true,
      },
    })

    if (!receptieExistenta) {
      return NextResponse.json({ error: "Recepția nu a fost găsită" }, { status: 404 })
    }

    // Dacă recepția este deja validată, nu permitem modificări
    if (receptieExistenta.validat) {
      return NextResponse.json({ error: "Recepția este deja validată și nu poate fi modificată" }, { status: 400 })
    }

    // Actualizăm recepția
    const receptie = new Receptie(
      id,
      new Date(data.data || receptieExistenta.data),
      Number(data.valoare_totala || receptieExistenta.valoare_totala),
      data.id_cerere_aprovizionare || null,
      validat || false,
    )

    // Dacă recepția trebuie validată, apelăm metoda de validare
    if (validat) {
      await receptie.valideazaInDB(prisma)
    } else {
      await receptie.actualizeazaInDB(prisma)
    }

    // Ștergem liniile vechi și adăugăm liniile noi
    if (linii_receptie && linii_receptie.length > 0) {
      // Ștergem liniile vechi
      await prisma.linie_receptie.deleteMany({
        where: { id_receptie: id },
      })

      // Adăugăm liniile noi
      for (const linie of linii_receptie) {
        await prisma.linie_receptie.create({
          data: {
            id_receptie: id,
            id_bun: linie.id_bun,
            cantitate_receptionata: linie.cantitate_receptionata,
            pret: linie.pret,
            status: linie.status || "receptionata",
            validat: validat || false,
          },
        })
      }
    }

    // Obținem recepția actualizată
    const receptieActualizata = await prisma.receptie.findUnique({
      where: { nr_document: id },
      include: {
        document: true,
        linii_receptie: {
          include: {
            bun: true,
          },
        },
      },
    })

    return NextResponse.json(Receptie.fromPrisma(receptieActualizata!))
  } catch (error: any) {
    console.error("Eroare la actualizarea recepției:", error)
    return NextResponse.json({ error: error.message || "Eroare la actualizarea recepției" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = Number.parseInt(context.params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 })
    }

    const receptie = await prisma.receptie.findUnique({
      where: { nr_document: id },
    })

    if (!receptie) {
      return NextResponse.json({ error: "Recepția nu a fost găsită" }, { status: 404 })
    }

    // Dacă recepția este validată, nu permitem ștergerea
    if (receptie.validat) {
      return NextResponse.json({ error: "Recepția este validată și nu poate fi ștearsă" }, { status: 400 })
    }

    // Ștergem liniile de recepție
    await prisma.linie_receptie.deleteMany({
      where: { id_receptie: id },
    })

    // Ștergem recepția
    await prisma.receptie.delete({
      where: { nr_document: id },
    })

    // Ștergem documentul
    await prisma.document.delete({
      where: { nr_document: id },
    })

    return NextResponse.json({ message: "Recepția a fost ștearsă cu succes" })
  } catch (error) {
    console.error("Eroare la ștergerea recepției:", error)
    return NextResponse.json({ error: "Eroare la ștergerea recepției" }, { status: 500 })
  }
}
