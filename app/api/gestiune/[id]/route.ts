// app/api/gestiune/[id]/route.ts

import { NextResponse } from "next/server";
import { GestiuneService } from "@/lib/services/GestiuneService";

const service = new GestiuneService();

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const id = parseInt(context.params.id);
    const gestiune = await service.getById(id);
    return NextResponse.json(gestiune);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const id = parseInt(context.params.id);
    const body = await req.json();
    const updated = await service.updateGestiune(id, {
      denumire: body.denumire,
      id_gestionar: body.id_gestionar ?? null
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const id = parseInt(context.params.id);
    await service.deleteGestiune(id);
    return NextResponse.json({ message: "Gestiune ștearsă." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
