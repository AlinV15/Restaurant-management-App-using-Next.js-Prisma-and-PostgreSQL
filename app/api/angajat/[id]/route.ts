// app/api/angajat/[id]/route.ts

import { NextResponse } from "next/server";
import { AngajatService } from "@/lib/services/AngajatService";

const service = new AngajatService();

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const angajat = await service.getById(id);
        return NextResponse.json(angajat);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const data = await req.json();
        const updated = await service.updateAngajat(id, {
            nume_angajat: data.nume_angajat,
            prenume_angajat: data.prenume_angajat,
            functie: data.functie,
            telefon: data.telefon,
            email: data.email,
            data_angajare: data.data_angajare
        });
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        await service.deleteAngajat(id);
        return NextResponse.json({ message: "Angajat șters." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
