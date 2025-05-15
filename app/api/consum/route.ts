import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Consum } from "@/lib/classes/Consum";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const result = await prisma.$transaction(async (tx) => {
            return await Consum.createFromInput(body, tx);
        });

        return NextResponse.json({
            message: "Consum creat cu succes",
            consum_id: result.consum_id,
            valoare: result.valoare,
            linii: result.linii
        }, { status: 201 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || "Eroare server" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const consumuriDb = await prisma.consum.findMany({
            include: {
                liniiConsum: { include: { bun: true } },
                gestiune: true,
                sef: true
            }
        });

        const consumuri = consumuriDb.map(consum => Consum.fromPrisma(consum));

        return NextResponse.json(consumuri, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}
