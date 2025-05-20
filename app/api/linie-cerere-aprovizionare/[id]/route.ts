// app/api/linie-cerere-aprovizionare/[id]/route.ts

import { NextResponse } from "next/server";
import { LinieCerereAprovizionareService } from "@/lib/services/LinieCerereAprovizionareService";

const service = new LinieCerereAprovizionareService();

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const id = await parseInt(context.params.id);
        const linie = await service.getById(id);
        return NextResponse.json(linie);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
    try {
        const id = await parseInt(context.params.id);
        const body = await req.json();
        const updated = await service.updateLinie(id, {
            cantitate: body.cantitate,
            valoare: body.valoare,
            observatii: body.observatii ?? null
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const id = await parseInt(context.params.id);
        await service.deleteLinie(id);
        return NextResponse.json({ message: "Linie ștearsă." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
