// app/api/linie-consum/[id]/route.ts

import { NextResponse } from "next/server";
import { LinieConsumService } from "@/lib/services/LinieConsumService";

const service = new LinieConsumService();

export async function GET(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        const linie = await service.getById(id);
        return NextResponse.json(linie);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
    try {
        const id = parseInt(context.params.id);
        await service.deleteLinie(id);
        return NextResponse.json({ message: "Linie de consum ștearsă." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
