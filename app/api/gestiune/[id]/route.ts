
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Gestiune } from "@/lib/classes/Gestiune";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const { denumire, id_gestionar } = await req.json();

    if (!denumire || !id_gestionar) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const updated = await prisma.gestiune.update({
      where: { id_gestiune: id },
      data: {
        denumire,
        id_gestionar: Number(id_gestionar),
      },
    });

    return NextResponse.json(Gestiune.fromPrisma(updated), { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update gestiune" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 400 });
    }

    const deleted = await prisma.gestiune.delete({
      where: { id_gestiune: id },
    });

    return NextResponse.json(Gestiune.fromPrisma(deleted), { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete gestiune" }, { status: 500 });
  }
}
