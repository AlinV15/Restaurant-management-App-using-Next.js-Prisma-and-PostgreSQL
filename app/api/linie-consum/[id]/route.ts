import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LinieConsum } from "@/lib/classes/LinieConsum";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

        const body = await req.json();
        const { id_bun, id_consum, cantitate_necesara, cant_eliberata } = body;

        if (!id_bun || !id_consum || !cantitate_necesara || !cant_eliberata) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updated = await LinieConsum.updateInDB(prisma, id, {
            id_bun: parseInt(id_bun),
            id_consum: parseInt(id_consum),
            cantitate_necesara,
            cant_eliberata
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error: any) {
        console.error("PUT error:", error);
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

        await LinieConsum.deleteFromDB(prisma, id);

        return NextResponse.json({ message: "Linie consum ștearsă" }, { status: 200 });
    } catch (error: any) {
        console.error("DELETE error:", error);
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}
