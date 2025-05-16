import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Consum } from "@/lib/classes/Consum";


export async function GET() {
    try {
        const consum = await prisma.consum.findMany({
            include: {
                gestiune: true,
                liniiConsum: true,
                sef: true
            }
        });


        return NextResponse.json(consum.map(Consum.fromPrisma), { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        await Consum.createFromInput(body, prisma);

    } catch (error) {
        console.log(error);
        const errorMessage = error instanceof Error ? error.message : "Error creating data";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}