import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Angajat } from "@/lib/classes/Angajat";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
    try {

        const { id } = await context.params;
        const idNumeric = parseInt(id);

        if (isNaN(idNumeric)) {
            return NextResponse.json({ error: 'Id-ul este invalid' }, { status: 404 });
        }
        const data = await request.json();
        const angajatActualizat = await Angajat.updateAngajat(data, idNumeric, prisma);

        return NextResponse.json(Angajat.fromPrisma(angajatActualizat), { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const idNumeric = parseInt(id);
        if (!idNumeric) {
            return NextResponse.json({ error: 'Angajatul nu a fost găsit' }, { status: 404 });
        }
        const existingAngajat = await prisma.angajati.findUnique({
            where: { id_angajat: idNumeric },
        });

        if (!existingAngajat) {
            return NextResponse.json({ error: 'Angajatul nu a fost găsit' }, { status: 404 });
        }

        await prisma.angajati.delete({
            where: { id_angajat: idNumeric },
        });

        return NextResponse.json({ message: 'Angajatul a fost șters cu succes!' }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}