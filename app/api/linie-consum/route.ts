import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { LinieConsum } from "@/lib/classes/LinieConsum";

export async function GET() {
    try {
        const data = await prisma.linieConsum.findMany({ include: { bun: true } });
        return NextResponse.json(data.map(LinieConsum.fromPrisma), { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_bun, id_consum, cantitate_necesara, cant_eliberata } = body;

        if (!id_bun || !id_consum || !cantitate_necesara || !cant_eliberata) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const bun = await prisma.bun.findUnique({ where: { id_bun: parseInt(id_bun) } });
        const consum = await prisma.consum.findUnique({ where: { id_consum: parseInt(id_consum) } });
        const stoc = await prisma.stoc.findFirst({
            where: {
                id_bun: parseInt(id_bun),
                id_gestiune: consum?.id_gestiune
            }
        });

        if (!bun || !consum || !stoc) {
            return NextResponse.json({ error: "Bun, consum sau stoc lipsă" }, { status: 404 });
        }

        if (cant_eliberata > bun.cantitate_disponibila) {
            const cerereResponse = await fetch("http://localhost:3000/api/cerere-aprovizionare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_gestiune: consum.id_gestiune })
            });

            const cerere = await cerereResponse.json();

            await fetch("http://localhost:3000/api/linie-cerere-aprovizionare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_cerere: cerere.id_cerere,
                    id_bun: bun.id_bun,
                    cantitate: stoc.cantitate_optima || (cant_eliberata - Number(bun.cantitate_disponibila)) * 2,
                    observatii: "Cerere automată"
                })
            });

            return NextResponse.json({
                error: "Cantitate insuficientă. Cerere trimisă.",
                cerereId: cerere.id_cerere
            }, { status: 400 });
        }

        const linie = await LinieConsum.createInDB(prisma, {
            id_bun: parseInt(id_bun),
            id_consum: parseInt(id_consum),
            cantitate_necesara,
            cant_eliberata
        });

        return NextResponse.json(LinieConsum.fromPrisma(linie), { status: 201 });
    } catch (error: any) {
        console.error("POST error:", error);
        return NextResponse.json({ error: error.message || "Error creating data" }, { status: 500 });
    }
}
