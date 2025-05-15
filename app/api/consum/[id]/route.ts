import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Consum } from "@/lib/classes/Consum";
import { LinieConsum } from "@/lib/classes/LinieConsum";


export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    const id = parseInt(context.params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

    const body = await req.json();
    const { valoare, data, id_sef, id_gestiune, linii } = body;

    if (!valoare || !data || !id_gestiune || !Array.isArray(linii)) {
        return NextResponse.json({ error: "Date lipsă sau invalide" }, { status: 400 });
    }

    try {
        const consum = new Consum(id, new Date(data), valoare, id_sef ?? null, id_gestiune);

        await consum.actualizeazaInDB(prisma);

        const liniiConsum = linii.map((l: any) => new LinieConsum(
            0, // id_linie_consum (necunoscut pentru creare)
            id,
            l.id_bun,
            Number(l.cantitate_necesara),
            Number(l.valoare),
            Number(l.cant_eliberata)
        ));

        await consum.refaStocuriSiLinii(prisma, liniiConsum);

        const consumFinal = await prisma.consum.findUnique({
            where: { id_consum: id },
            include: {
                liniiConsum: { include: { bun: true } },
                gestiune: true,
                sef: true
            }
        });

        return NextResponse.json(Consum.fromPrisma(consumFinal));
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}


export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
    const id = parseInt(context.params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

    try {
        const consumDb = await prisma.consum.findUnique({
            where: { id_consum: id }
        });

        if (!consumDb) {
            return NextResponse.json({ error: "Consum inexistent" }, { status: 404 });
        }

        const consum = Consum.fromPrisma(consumDb);
        await consum.stergeDinDB(prisma);

        return NextResponse.json({ message: "Consum șters cu succes" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    const { id } = await context.params;

    if (!id) {
        return NextResponse.json({ error: "ID-ul lipsește" }, { status: 400 });
    }

    try {
        const consumDb = await prisma.consum.findUnique({
            where: { id_consum: parseInt(id) },
            include: {
                gestiune: true,
                sef: true,
                liniiConsum: { include: { bun: true } }
            }
        });

        if (!consumDb) {
            return NextResponse.json({ error: "Consum inexistent" }, { status: 404 });
        }

        const consum = Consum.fromPrisma(consumDb);
        return NextResponse.json(consum, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}
