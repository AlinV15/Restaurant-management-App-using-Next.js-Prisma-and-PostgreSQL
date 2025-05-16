import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LinieConsum } from "@/lib/classes/LinieConsum";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        await LinieConsum.updateInDB(prisma, id, body)
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error updating data" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        LinieConsum.deleteFromDB(prisma, id);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error deleting data" }, { status: 500 });
    }
}