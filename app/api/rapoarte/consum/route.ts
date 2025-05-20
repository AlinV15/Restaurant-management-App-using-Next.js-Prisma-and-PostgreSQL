import { NextResponse, NextRequest } from "next/server";
import { ConsumRaportBuilder } from "@/lib/builders/ConsumRaportBuilder";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const raportBuilder = ConsumRaportBuilder.fromSearchParams(searchParams);

        const rezultat = await raportBuilder.build();

        return NextResponse.json(rezultat, { status: 200 });
    } catch (error) {
        console.error("Eroare la generarea raportului de consum:", error);
        return NextResponse.json(
            { error: "Eroare la generarea raportului de consum" },
            { status: 500 }
        );
    }
}