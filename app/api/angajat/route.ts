import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Angajat } from "@/lib/classes/Angajat";

export async function GET() {
    try {
        const angajati = await prisma.angajati.findMany();
        const response = angajati.map(Angajat.fromPrisma);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Eroare în preluarea angajaților:", error);
        return NextResponse.json({ error: "A apărut o eroare la preluarea angajaților" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nume, prenume, functie, telefon, email, data_angajare } = body;

        if (!nume || !prenume || !functie || !telefon || !email || !data_angajare) {
            return NextResponse.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 });
        }

        const angajat = await prisma.angajati.create({
            data: {
                nume_angajat: nume,
                prenume_angajat: prenume,
                functie,
                telefon,
                email,
                data_angajare,
            },
        });

        return NextResponse.json(Angajat.fromPrisma(angajat), { status: 201 });
    } catch (error) {
        console.error("Eroare la adăugarea angajatului:", error);
        return NextResponse.json({ error: "Eroare internă la creare" }, { status: 500 });
    }
}
