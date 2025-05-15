

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

        const data = await req.json();
        const linieNoua = await LinieCerereAprovizionare.updateInDB(prisma, id, data);

        return NextResponse.json(linieNoua, { status: 200 });
    } catch (error: any) {
        console.error("PUT error:", error);
        return NextResponse.json({ error: error.message || "Eroare server" }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        if (isNaN(id)) return NextResponse.json({ error: "ID invalid" }, { status: 400 });

        await LinieCerereAprovizionare.deleteFromDB(prisma, id);

        return NextResponse.json({ message: "Linie ștearsă cu succes" }, { status: 200 });
    } catch (error: any) {
        console.error("DELETE error:", error);
        return NextResponse.json({ error: error.message || "Eroare server" }, { status: 500 });
    }
}
