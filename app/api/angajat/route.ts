// app/api/angajat/route.ts

import { NextResponse } from "next/server";
import { AngajatService } from "@/lib/services/AngajatService";

const service = new AngajatService();

export async function GET() {
    try {
        const angajati = await service.getAll();
        return NextResponse.json(angajati);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const angajat = await service.createAngajat({
            nume_angajat: data.nume_angajat,
            prenume_angajat: data.prenume_angajat,
            functie: data.functie,
            telefon: data.telefon,
            email: data.email,
            data_angajare: data.data_angajare
        });
        return NextResponse.json(angajat, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
