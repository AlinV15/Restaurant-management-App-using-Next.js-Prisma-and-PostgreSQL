// app/api/consum/route.ts

import { NextResponse } from "next/server";
import { ConsumService } from "@/lib/services/ConsumService";

const service = new ConsumService();

export async function GET() {
    try {
        const consumuri = await service.getAll();
        return NextResponse.json(consumuri);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const consum = await service.creeazaConsum({
            id_gestiune: body.id_gestiune,
            id_sef: body.id_sef,
            linii: body.linii.map((linie: any) => ({
                id_bun: linie.id_bun,
                cantitate_necesara: linie.cantitate_necesara,
                cant_eliberata: linie.cant_eliberata,
                valoare: linie.valoare
            }))
        });
        return NextResponse.json(consum, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
