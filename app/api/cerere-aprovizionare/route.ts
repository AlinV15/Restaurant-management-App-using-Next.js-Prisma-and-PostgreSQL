import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
//import { StatusCerere } from "@prisma/client";
import { CerereAprovizionare } from "@/lib/classes/CerereAprovizionare";

export async function GET() {
    try {
        const cereriAprov = await prisma.cerereAprovizionare.findMany();

        return NextResponse.json(cereriAprov.map(CerereAprovizionare.fromPrisma), { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });

    }
}

export async function POST(request: NextRequest) {
    try {

        const body = await request.json();
        const cerereAprov = await CerereAprovizionare.createFromInput(body, prisma);

        return NextResponse.json(CerereAprovizionare.fromPrisma(cerereAprov), { status: 201 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Eroare server" }, { status: 500 });

    }
}
