import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "path";
import { Gestiune } from "@/lib/classes/Gestiune";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    const idNumeric = parseInt(id);
    if (isNaN(idNumeric)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 404 });
    }
    const body = await req.json();
    const { denumire, id_gestionar } = body;
    if (!denumire || !id_gestionar) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }


    const updatedProduct = await prisma.gestiune.update({
      where: { id_gestiune: idNumeric },
      data: {
        denumire,
        id_gestionar: Number(id_gestionar),
      },
    });

    return NextResponse.json(Gestiune.fromPrisma(updatedProduct), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    const idNumeric = parseInt(id);
    if (isNaN(idNumeric)) {
      return NextResponse.json({ error: "ID invalid" }, { status: 404 });
    }
    const deletedProduct = await prisma.gestiune.delete({
      where: { id_gestiune: idNumeric },
    });

    return NextResponse.json(Gestiune.fromPrisma(deletedProduct), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}