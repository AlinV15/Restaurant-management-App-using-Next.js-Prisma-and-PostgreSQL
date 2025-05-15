import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Stoc } from "@/lib/classes/Stoc";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { id_bun, id_gestiune, stoc_init_lunar, prag_minim, cantitate_optima } = body;

        if (!id_bun || !id_gestiune || !stoc_init_lunar || !prag_minim || !cantitate_optima) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updated = await Stoc.updateInDB(prisma, id, body);
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("PUT error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const deleted = await Stoc.deleteFromDB(prisma, id);
        return NextResponse.json(deleted, { status: 200 });
    } catch (error) {
        console.error("DELETE error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
