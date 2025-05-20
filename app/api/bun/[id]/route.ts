// app/api/bun/[id]/route.ts

import { NextResponse } from "next/server";
import { BunService } from "@/lib/services/BunService";

const service = new BunService();

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const bun = await service.getById(id);
        return NextResponse.json(bun);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const body = await req.json();
        const updated = await service.updateBun(id, {
            nume_bun: body.nume_bun,
            cantitate_disponibila: Number(body.cantitate_disponibila),
            pret_unitar: Number(body.pret_unitar),
            data_expirare: body.data_expirare ? new Date(body.data_expirare) : undefined,
            unitate_masura: body.unitate_masura
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        await service.deleteBun(id);
        return NextResponse.json({ message: "Șters cu succes." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
