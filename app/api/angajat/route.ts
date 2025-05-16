import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Angajat } from "@/lib/classes/Angajat";

export async function GET() {
    try {
        const angajati = await prisma.angajati.findMany();
        const res = angajati.map(Angajat.fromPrisma)
        return NextResponse.json(res);

    } catch (error) {
        console.error("Eroare in preluarea angajatilor:", error);
        return NextResponse.json({ error: "A aparut o eroare la preluarea angajatilor" }, { status: 500 });

    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const angajat = await Angajat.postAngajat(data, prisma)
        return NextResponse.json(Angajat.fromPrisma(angajat), { status: 201 });

    } catch (error) {
        console.error("Eroare in adaugarea angajatului:", error);
        return NextResponse.json({ error: "A aparut o eroare la adaugarea angajatului" }, { status: 500 });

    }
}