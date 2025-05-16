import { Bun } from "@/lib/classes/Bun";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';



export async function GET() {
    try {
        const bunuri = await prisma.bun.findMany();
        return NextResponse.json(Bun.fromPrisma(bunuri));
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const bunNou = await Bun.createBun(data, prisma);
        return NextResponse.json(Bun.fromPrisma(bunNou), { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

