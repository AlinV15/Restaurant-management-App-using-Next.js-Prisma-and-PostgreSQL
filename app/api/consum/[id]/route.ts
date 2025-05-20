// app/api/consum/[id]/route.ts

import { NextResponse } from "next/server";
import { ConsumService } from "@/lib/services/ConsumService";

const service = new ConsumService();

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const consum = await service.getById(id);
        return NextResponse.json(consum);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const body = await req.json();
        const updated = await service.updateConsum(id, {
            id_gestiune: body.id_gestiune,
            id_sef: body.id_sef,
            linii: body.linii.map((linie: any) => ({
                id_bun: linie.id_bun,
                cantitate_necesara: linie.cantitate_necesara,
                cant_eliberata: linie.cant_eliberata,
                valoare: linie.valoare
            }))
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        await service.stergeConsum(id);
        return NextResponse.json({ message: "Șters cu succes." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}