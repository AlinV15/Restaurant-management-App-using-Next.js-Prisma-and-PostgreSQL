import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { CerereAprovizionare } from "@/lib/classes/CerereAprovizionare";


export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;

        const body = await req.json();
        const cerereAprov = await CerereAprovizionare.updateStatusCerere(body, id, prisma);

        return NextResponse.json(CerereAprovizionare.fromPrisma(cerereAprov), { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        await CerereAprovizionare.stergere(id, prisma);
        return NextResponse.json("Document sters cu succes", { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });
    }
}