// app/api/cerere-aprovizionare/[id]/route.ts

import { NextResponse } from "next/server";
import { CerereAprovizionareService } from "@/lib/services/CerereAprovizionareService";
import { StatusCerere } from "@/lib/classes/CerereAprovizionare";

const service = new CerereAprovizionareService();

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const cerere = await service.getById(id);
        return NextResponse.json(cerere);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const { status } = await req.json();
        if (!status || !(status in StatusCerere)) {
            throw new Error("Status invalid.");
        }
        await service.schimbaStatus(id, status);
        return NextResponse.json({ message: "Status actualizat." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        await service.stergeCerere(id);
        return NextResponse.json({ message: "Cerere ștearsă." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
