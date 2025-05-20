// app/api/cerere-aprovizionare/route.ts

import { NextResponse } from "next/server";
import { CerereAprovizionareService } from "@/lib/services/CerereAprovizionareService";
import { StatusCerere } from "@/lib/classes/CerereAprovizionare";

const service = new CerereAprovizionareService();

export async function GET() {
    try {
        const cereri = await service.getAll();
        return NextResponse.json(cereri);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const cerere = await service.creeazaCerere({
            id_gestiune: body.id_gestiune,
            valoare: Number(body.valoare),
            status: body.status in StatusCerere ? body.status : StatusCerere.IN_ASTEPTARE,
            linii: body.linii.map((linie: any) => ({
                id_bun: linie.id_bun,
                cantitate: linie.cantitate,
                valoare: linie.valoare,
                observatii: linie.observatii ?? null
            }))
        });
        return NextResponse.json(cerere, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
