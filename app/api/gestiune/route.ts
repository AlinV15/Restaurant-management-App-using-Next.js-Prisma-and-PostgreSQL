// app/api/gestiune/route.ts

import { NextResponse } from "next/server";
import { GestiuneService } from "@/lib/services/GestiuneService";

const service = new GestiuneService();

export async function GET() {
    try {
        const gestiuni = await service.getAll();
        return NextResponse.json(gestiuni);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const gestiune = await service.createGestiune({
            denumire: body.denumire,
            id_gestionar: body.id_gestionar ?? null
        });
        return NextResponse.json(gestiune, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
