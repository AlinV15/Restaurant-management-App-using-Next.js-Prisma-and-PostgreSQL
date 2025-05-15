import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CerereAprovizionare, StatusCerere } from "@/lib/classes/CerereAprovizionare";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const { status } = await req.json();

        if (!status) {
            return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
        }

        const cerere = await prisma.cerereAprovizionare.findUnique({
            where: { nr_document: id },
        });

        if (!cerere) {
            return NextResponse.json({ error: "Cererea nu există" }, { status: 404 });
        }

        if (status === StatusCerere.APROBATA) {
            const linii = await prisma.linieCerereAprovizionare.findMany({
                where: { id_cerere: id },
            });

            for (const linie of linii) {
                await prisma.bun.update({
                    where: { id_bun: linie.id_bun },
                    data: {
                        cantitate_disponibila: { increment: linie.cantitate },
                    },
                });

                await prisma.stoc.updateMany({
                    where: {
                        id_bun: linie.id_bun,
                        id_gestiune: cerere.id_gestiune,
                    },
                    data: {
                        stoc_actual: { increment: linie.cantitate },
                    },
                });
            }
        }

        const actualizata = await prisma.cerereAprovizionare.update({
            where: { nr_document: id },
            data: { status },
        });

        return NextResponse.json(CerereAprovizionare.fromPrisma(actualizata));
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);

        const cerere = await prisma.cerereAprovizionare.findUnique({
            where: { nr_document: id },
        });

        if (!cerere) {
            return NextResponse.json({ error: "Cererea nu există" }, { status: 404 });
        }

        const linii = await prisma.linieCerereAprovizionare.findMany({
            where: { id_cerere: id },
        });
        const statusEnum = status as StatusCerere;

        for (const linie of linii) {
            if (statusEnum === StatusCerere.APROBATA) {
                await prisma.bun.update({
                    where: { id_bun: linie.id_bun },
                    data: {
                        cantitate_disponibila: { decrement: linie.cantitate },
                    },
                });

                await prisma.stoc.updateMany({
                    where: {
                        id_bun: linie.id_bun,
                        id_gestiune: cerere.id_gestiune,
                    },
                    data: {
                        stoc_actual: { decrement: linie.cantitate },
                    },
                });
            }

            await prisma.linieCerereAprovizionare.delete({ where: { id: linie.id } });
        }

        await prisma.cerereAprovizionare.delete({ where: { nr_document: id } });
        await prisma.document.delete({ where: { nr_document: id } });

        return NextResponse.json({ message: "Cererea și documentul au fost șterse cu succes" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}


export async function GET(req: NextRequest, context: { params: { id: string } }) {
    try {
        const id = await Number(context.params.id)
        if (!id) {
            return NextResponse.json({ error: "Nr. cererii nu a fost gasit" }, { status: 404 })
        }
        const liniiCereri = await prisma.linieCerereAprovizionare.findMany({
            where: {
                id_cerere: id
            }
        })

        return NextResponse.json(liniiCereri, { status: 200 })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: "Eroare in preluarea liniilor" }, { status: 500 })
    }
}