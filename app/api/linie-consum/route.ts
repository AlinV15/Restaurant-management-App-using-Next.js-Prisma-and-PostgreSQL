import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { LinieConsum } from "@/lib/classes/LinieConsum";

export async function GET() {
    try {
        const linieConsum = await prisma.linieConsum.findMany();

        return NextResponse.json(linieConsum.map(LinieConsum.fromPrisma), { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "ErrWor fetching data" }, { status: 500 });

    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        await LinieConsum.createInDB(prisma, body);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error creating data" }, { status: 500 });

    }
}
