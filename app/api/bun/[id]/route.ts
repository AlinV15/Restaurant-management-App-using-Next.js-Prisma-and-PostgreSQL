import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Bun } from "@/lib/classes/Bun";

export async function PUT(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: "ID invalid" }, { status: 400 });
        }

        const body = await request.json();
        const { nume_bun, cantitate_disponibila, pret_unitar, data_expirare, unitate_masura } = body;

        if (!nume_bun || !cantitate_disponibila || !pret_unitar || !unitate_masura) {
            return NextResponse.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 });
        }

        const existingBun = await prisma.bun.findUnique({
            where: { id_bun: id },
        });

        if (!existingBun) {
            return NextResponse.json({ error: "Bunul nu a fost găsit" }, { status: 404 });
        }

        const updated = await prisma.bun.update({
            where: { id_bun: id },
            data: {
                nume_bun,
                cantitate_disponibila,
                pret_unitar,
                unitate_masura,
                data_expirare: data_expirare ? new Date(data_expirare) : null,
            },
        });

        const existaStoc = await prisma.stoc.findMany({ where: { id_bun: id } });
        if (existaStoc.length > 0) {
            await prisma.stoc.updateMany({
                where: { id_bun: id },
                data: { stoc_actual: cantitate_disponibila },
            });

            if (new Date().getDay() === 1) {
                await prisma.stoc.updateMany({
                    where: { id_bun: id },
                    data: { stoc_init_lunar: cantitate_disponibila },
                });
            }
        }

        return NextResponse.json(Bun.fromPrisma(updated), { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
    }
}

export async function DELETE(
    _: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: "ID invalid" }, { status: 400 });
        }

        const existing = await prisma.bun.findUnique({
            where: { id_bun: id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Bunul nu a fost găsit" }, { status: 404 });
        }

        await prisma.stoc.deleteMany({ where: { id_bun: id } });
        await prisma.bun.delete({ where: { id_bun: id } });

        return NextResponse.json({ message: "Bunul a fost șters cu succes!" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
    }
}
