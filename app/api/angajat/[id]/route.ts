import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Angajat } from "@/lib/classes/Angajat";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) return NextResponse.json({ error: "Id invalid" }, { status: 400 });

        const body = await request.json();
        const { nume, prenume, email, telefon, functie, data_angajare } = body;

        if (!nume || !prenume || !email || !telefon || !functie || !data_angajare)
            return NextResponse.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 });

        const existing = await prisma.angajati.findUnique({ where: { id_angajat: id } });
        if (!existing) return NextResponse.json({ error: "Angajatul nu a fost găsit" }, { status: 404 });

        const updated = await prisma.angajati.update({
            where: { id_angajat: id },
            data: {
                nume_angajat: nume,
                prenume_angajat: prenume,
                email,
                telefon,
                functie,
                data_angajare,
            },
        });

        return NextResponse.json(Angajat.fromPrisma(updated));
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) return NextResponse.json({ error: "Id invalid" }, { status: 400 });

        const existing = await prisma.angajati.findUnique({ where: { id_angajat: id } });
        if (!existing) return NextResponse.json({ error: "Angajatul nu a fost găsit" }, { status: 404 });

        await prisma.angajati.delete({ where: { id_angajat: id } });

        return NextResponse.json({ message: "Șters cu succes" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
    }
}

