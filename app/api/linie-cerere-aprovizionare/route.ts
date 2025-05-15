import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const idCerere = url.searchParams.get("nr_document");

        const query: any = {
            include: {
                bun: true
            }
        };

        if (idCerere) {
            query.where = { nr_document: Number(idCerere) };
        }

        const linii = await prisma.linieCerereAprovizionare.findMany(query);
        return NextResponse.json(linii.map(LinieCerereAprovizionare.fromPrisma), { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const { id_cerere, id_bun, cantitate, observatii } = data;
        if (!id_cerere || !id_bun || !cantitate || !observatii) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const linieNoua = await LinieCerereAprovizionare.createInDB(prisma, data);
        return NextResponse.json(LinieCerereAprovizionare.fromPrisma(linieNoua), { status: 201 });
    } catch (error: any) {
        console.error("Error creating data:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
