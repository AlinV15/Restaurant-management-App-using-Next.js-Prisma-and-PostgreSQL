import { NextRequest, NextResponse } from "next/server";
import { ConsumRaportBuilder } from "@/lib/classes/ConsumRaportBuilder";

export async function GET(request: NextRequest) {
    try {
        const builder = new ConsumRaportBuilder(request.nextUrl.searchParams);
        const raport = await builder.build();
        return NextResponse.json(raport, { status: 200 });
    } catch (error: any) {
        console.error("Eroare la generarea raportului:", error);
        return NextResponse.json(
            { error: error.message || "Eroare internă la raport" },
            { status: 500 }
        );
    }
}
