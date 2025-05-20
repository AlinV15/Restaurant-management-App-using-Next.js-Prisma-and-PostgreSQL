import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { LinieReceptie } from "@/lib/classes/LinieReceptie"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = Number.parseInt(context.params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 })
    }

    const linie = await prisma.linie_receptie.findUnique({
      where: { id_linie_receptie: id },
      include: {
        bun: true,
      },
    })

    if (!linie) {
      return NextResponse.json({ error: "Linia de recepție nu a fost găsită" }, { status: 404 })
    }

    return NextResponse.json(LinieReceptie.fromPrisma(linie))
  } catch (error) {
    console.error("Eroare la obținerea liniei de recepție:", error)
    return NextResponse.json({ error: "Eroare la obținerea liniei de recepție" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = Number.parseInt(context.params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 })
    }

    const data = await request.json()
    const linie = await LinieReceptie.updateInDB(prisma, id, data)
    return NextResponse.json(LinieReceptie.fromPrisma(linie))
  } catch (error: any) {
    console.error("Eroare la actualizarea liniei de recepție:", error)
    return NextResponse.json({ error: error.message || "Eroare la actualizarea liniei de recepție" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const id = Number.parseInt(context.params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 })
    }

    await LinieReceptie.deleteFromDB(prisma, id)
    return NextResponse.json({ message: "Linia de recepție a fost ștearsă cu succes" })
  } catch (error: any) {
    console.error("Eroare la ștergerea liniei de recepție:", error)
    return NextResponse.json({ error: error.message || "Eroare la ștergerea liniei de recepție" }, { status: 500 })
  }
}
