// app/api/bun/route.ts

import { NextResponse } from "next/server";
import { BunService } from "@/lib/services/BunService";

const service = new BunService();

export async function GET() {
    try {
        const bunuri = await service.getAll();
        return NextResponse.json(bunuri);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const bun = await service.createBun({
            nume_bun: body.nume_bun,
            cantitate_disponibila: Number(body.cantitate_disponibila),
            pret_unitar: Number(body.pret_unitar),
            data_expirare: body.data_expirare ? new Date(body.data_expirare) : undefined,
            unitate_masura: body.unitate_masura
        });
        return NextResponse.json(bun, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}