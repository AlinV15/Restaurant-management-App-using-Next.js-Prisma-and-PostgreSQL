import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const data = await req.json();

        const updatedLinieCerereAprovizionare = await LinieCerereAprovizionare.updateInDB(prisma, id, data);

        return NextResponse.json(LinieCerereAprovizionare.fromPrisma(updatedLinieCerereAprovizionare), { status: 200 });
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;

    try {
        await LinieCerereAprovizionare.deleteFromDB(prisma, id);

        return NextResponse.json({ message: "Linie Cerere Aprovizionare deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}