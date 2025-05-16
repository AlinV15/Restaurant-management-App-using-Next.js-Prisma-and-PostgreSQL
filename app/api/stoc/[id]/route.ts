import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { Stoc } from '@/lib/classes/Stoc';

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const idNumeric = parseInt(id);
        if (isNaN(idNumeric)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 404 });
        }

        const body = await req.json();
        const data = await Stoc.updateInDB(prisma, idNumeric, body);

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const { id } = await context.params;
    const idNumeric = parseInt(id);

    try {
        const data = await prisma.stoc.delete({
            where: { id_stoc: idNumeric }
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error deleting data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}