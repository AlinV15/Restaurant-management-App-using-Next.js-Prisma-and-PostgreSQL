import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StatusCerere as PrismaStatusCerere } from "@prisma/client";
import { StatusCerere as AppStatusCerere, CerereAprovizionare } from "@/lib/classes/CerereAprovizionare";
import { mapToPrismaStatus } from "@/app/utils/statusMapper";

export async function POST(request: NextRequest) {
    try {
        const { id_gestiune } = await request.json();

        if (!id_gestiune) {
            return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
        }

        const doc = await prisma.document.create({ data: { data: new Date() } });

        const cerere = await prisma.cerereAprovizionare.create({
            data: {
                nr_document: doc.nr_document,
                id_gestiune,
                status: mapToPrismaStatus(AppStatusCerere.IN_ASTEPTARE),
                data: new Date(),
                valoare: 0,
            },
        });

        return NextResponse.json(CerereAprovizionare.fromPrisma(cerere), { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}




export async function GET() {
    try {
        const cereri = await prisma.cerereAprovizionare.findMany();
        const result = cereri.map(CerereAprovizionare.fromPrisma);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}

