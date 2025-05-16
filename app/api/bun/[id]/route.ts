import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma" // Adjust the import path as necessary
import { Bun } from "@/lib/classes/Bun";

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await context.params;
        const idNumeric = parseInt(id);

        if (isNaN(idNumeric)) {
            return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
        }

        const bunul = await prisma.bun.findUnique({
            where: {
                id_bun: idNumeric
            }

        })
        return NextResponse.json(Bun.fromPrisma(bunul), { status: 200 });
    } catch (e) {
        console.log(e)
        return NextResponse.json({ error: "Server error" }, { status: 400 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: { id: string } }
) {

    try {
        const { id } = await context.params;
        const idNumeric = parseInt(id);

        if (isNaN(idNumeric)) {
            return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
        }
        const data = await request.json();
        const updatedBun = await Bun.actualizareBun(data, idNumeric, prisma);
        return NextResponse.json(Bun.fromPrisma(updatedBun), { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await context.params;
        Bun.deleteBun(id, prisma);
        return NextResponse.json({ message: 'Bunul a fost sters cu succes!' }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

    }
}
