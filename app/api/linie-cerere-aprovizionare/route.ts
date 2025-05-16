import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare";
export async function GET(request: NextRequest) {
    try {
        // Extragem parametrul id_cerere din URL, dacă există
        const url = new URL(request.url);
        const idCerere = url.searchParams.get('id_cerere');

        // Construim query-ul cu sau fără filtru după id_cerere
        const query: any = {
            include: {
                bun: true // Includerea datelor despre bunuri
            }
        };

        // Adăugăm filtrul pentru id_cerere dacă există
        if (idCerere) {
            query.where = {
                id_cerere: Number(idCerere)
            };
        }

        const liniiCerereAprovizionare = await prisma.linieCerereAprovizionare.findMany(query);

        return NextResponse.json(liniiCerereAprovizionare.map(LinieCerereAprovizionare.fromPrisma), { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const newLinieCerereAprovizionare = await LinieCerereAprovizionare.createInDB(prisma, data);

        return NextResponse.json(LinieCerereAprovizionare.fromPrisma(newLinieCerereAprovizionare), { status: 201 });
    } catch (error) {
        console.error("Error creating data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
