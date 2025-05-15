import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Bun } from "@/lib/classes/Bun";

export async function GET() {
    try {
        const bunuri = await prisma.bun.findMany();
        const result = bunuri.map(Bun.fromPrisma);
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nume_bun, cantitate_disponibila, pret_unitar, data_expirare, unitate_masura } = body;

        if (!nume_bun || !cantitate_disponibila || !pret_unitar || !unitate_masura) {
            return NextResponse.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 });
        }

        const bun = await prisma.bun.create({
            data: {
                nume_bun,
                cantitate_disponibila,
                pret_unitar,
                data_expirare: data_expirare ? new Date(data_expirare) : null,
                unitate_masura,
            },
        });

        return NextResponse.json(Bun.fromPrisma(bun), { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
    }
}
