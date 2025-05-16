import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Stoc } from "@/lib/classes/Stoc";

export async function GET() {
    try {
        const data = await prisma.stoc.findMany()
        return NextResponse.json(data.map(Stoc.fromPrisma), { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await Stoc.createInDB(prisma, body);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}