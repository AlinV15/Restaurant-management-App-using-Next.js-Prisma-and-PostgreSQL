// app/api/stoc/route.ts

import { NextResponse } from "next/server";
import { StocService } from "@/lib/services/StocService";

const service = new StocService();

export async function GET() {
    try {
        const stocuri = await service.getAll();
        return NextResponse.json(stocuri);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
