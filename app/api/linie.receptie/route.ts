import { NextResponse, type NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { LinieReceptie } from "@/lib/classes/LinieReceptie"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idReceptie = searchParams.get("id_receptie")

    const query: any = {
      include: {
        bun: true,
      },
    }

    if (idReceptie) {
      query.where = { id_receptie: Number.parseInt(idReceptie) }
    }

    const linii = await prisma.linie_receptie.findMany(query)
    return NextResponse.json(linii.map((linie) => LinieReceptie.fromPrisma(linie)))
  } catch (error) {
    console.error("Eroare la obținerea liniilor de recepție:", error)
    return NextResponse.json({ error: "Eroare la obținerea liniilor de recepție" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const linie = await LinieReceptie.createInDB(prisma, data)
    return NextResponse.json(LinieReceptie.fromPrisma(linie), { status: 201 })
  } catch (error: any) {
    console.error("Eroare la crearea liniei de recepție:", error)
    return NextResponse.json({ error: error.message || "Eroare la crearea liniei de recepție" }, { status: 500 })
  }
}
