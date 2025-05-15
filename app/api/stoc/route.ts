import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Stoc } from "@/lib/classes/Stoc";

export async function GET() {
    try {
        const stocuri = await prisma.stoc.findMany();
        return NextResponse.json(stocuri.map(Stoc.fromPrisma), { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id_bun, id_gestiune, stoc_init_lunar, prag_minim, cantitate_optima } = body;

        if (!id_bun || !id_gestiune || !stoc_init_lunar || !prag_minim || !cantitate_optima) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const stoc = await Stoc.createInDB(prisma, body);
        return NextResponse.json(stoc, { status: 201 });
    } catch (error: any) {
        console.error("Error creating data:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
