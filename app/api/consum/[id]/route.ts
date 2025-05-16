import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Consum } from "@/lib/classes/Consum";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const body = await req.json();
        await Consum.actualizeazaInDB(prisma, body, id);

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Error updating consum";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;

        const consum = await Consum.stergeDinDB(prisma, id)
        return NextResponse.json(Consum.fromPrisma(consum), { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error deleting data" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    const { id } = await context.params;
    if (id === undefined) {
        return NextResponse.json({ error: 'The id not found' }, { status: 404 })
    }
    try {

        const consum = await prisma.consum.findUnique({
            where: { nr_document: parseInt(id) },
            include: {
                gestiune: true,
                sef: true,
                liniiConsum: {

                    include: {
                        bun: true
                    }
                }
            }
        })
        return NextResponse.json(Consum.fromPrisma(consum), { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error getting data" }, { status: 500 });
    }

}