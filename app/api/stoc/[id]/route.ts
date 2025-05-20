// app/api/stoc/[id]/route.ts

import { NextResponse } from "next/server";
import { StocService } from "@/lib/services/StocService";

const service = new StocService();

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const stoc = await service.getById(id);
        return NextResponse.json(stoc);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const data = await req.json();
        const updated = await service.updateStoc(id, {
            stoc_init_lunar: data.stoc_init_lunar,
            stoc_actual: data.stoc_actual,
            prag_minim: data.prag_minim,
            cantitate_optima: data.cantitate_optima
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
