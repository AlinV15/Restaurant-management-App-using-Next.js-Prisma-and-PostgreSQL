// /app/api/rapoarte/consum/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(request: NextRequest) {
    try {
        // Extrage parametrii din query string
        const searchParams = request.nextUrl.searchParams;
        const dataStart = searchParams.get('dataStart');
        const dataEnd = searchParams.get('dataEnd');
        const gestiuniParam = searchParams.get('gestiuni');
        const bunuriParam = searchParams.get('bunuri');

        // Convertește parametrii în formate adecvate
        let gestiuni: number[] = [];
        if (gestiuniParam) {
            gestiuni = gestiuniParam.split(',').map(id => parseInt(id));
        }

        let bunuri: number[] = [];
        if (bunuriParam) {
            bunuri = bunuriParam.split(',').map(id => parseInt(id));
        }

        // Construiește condiția where pentru filtrare
        const whereClause: any = {
            document: {}
        };

        // Filtrare după interval de date
        if (dataStart || dataEnd) {
            whereClause.document.data = {};

            if (dataStart) {
                whereClause.document.data.gte = new Date(dataStart);
            }

            if (dataEnd) {
                // Setăm ora la sfârșitul zilei pentru a include toate înregistrările din ziua respectivă
                const endDate = new Date(dataEnd);
                endDate.setHours(23, 59, 59, 999);
                whereClause.document.data.lte = endDate;
            }
        }

        // Filtrare după gestiuni
        if (gestiuni.length > 0) {
            whereClause.id_gestiune = {
                in: gestiuni
            };
        }

        // Obținem toate consumurile conform filtrelor
        const consumuri = await prisma.consum.findMany({
            where: whereClause,
            include: {
                document: true,
                gestiune: true,
                sef: true,
                liniiConsum: {
                    include: {
                        bun: true
                    },
                    // Filtrare după bunuri la nivel de linii
                    ...(bunuri.length > 0 ? {
                        where: {
                            id_bun: {
                                in: bunuri
                            }
                        }
                    } : {})
                }
            },
            orderBy: {
                document: {
                    data: 'desc'
                }
            }
        });

        // Construim structura raportului
        const gestiuniMap = new Map();
        let totalGeneral = new Decimal(0);

        // Procesăm consumurile pentru a construi raportul
        for (const consum of consumuri) {
            // Verificăm dacă consumul are linii care corespund filtrelor
            if (consum.liniiConsum.length === 0) continue;

            // Calculăm total pentru acest consum
            const totalConsum = consum.liniiConsum.reduce(
                (sum, linie) => sum.plus(linie.valoare),
                new Decimal(0)
            );

            // Actualizăm totalul general
            totalGeneral = totalGeneral.plus(totalConsum);

            // Grupăm după gestiune
            const gestiuneKey = consum.id_gestiune;
            const gestiuneNume = consum.gestiune?.denumire || `Gestiune #${gestiuneKey}`;

            if (!gestiuniMap.has(gestiuneKey)) {
                gestiuniMap.set(gestiuneKey, {
                    id: gestiuneKey,
                    nume: gestiuneNume,
                    consumuri: [],
                    total: new Decimal(0)
                });
            }

            const gestiuneData = gestiuniMap.get(gestiuneKey);

            // Creăm obiectul pentru consumul curent
            const consumObj = {
                id_consum: consum.id_consum,
                data: consum.document.data,
                valoare: Number(totalConsum),
                liniiConsum: consum.liniiConsum.map(linie => ({
                    id_linie_consum: linie.id_linie_consum,
                    id_consum: linie.id_consum,
                    id_bun: linie.id_bun,
                    cantitate_necesara: linie.cant_eliberata,
                    valoare: Number(linie.valoare),
                    bun: {
                        id_bun: linie.bun.id_bun,
                        nume_bun: linie.bun.nume_bun,
                        pret_unitar: Number(linie.bun.pret_unitar),
                        unitate_masura: linie.bun.unitate_masura || "-",
                        cantitate_disponibila: linie.bun.cantitate_disponibila
                    }
                }))
            };

            // Adăugăm consumul la lista consumurilor gestiunii
            gestiuneData.consumuri.push(consumObj);

            // Adăugăm totalul consumului la totalul gestiunii
            gestiuneData.total = gestiuneData.total.plus(totalConsum);
        }

        // Convertim Map în array și ajustăm valorile Decimal pentru a fi serializate ca numere
        const gestiuniArray = Array.from(gestiuniMap.values()).map(gestiune => ({
            ...gestiune,
            total: Number(gestiune.total)
        }));

        // Construim și returnăm răspunsul final
        const rezultat = {
            title: "Centralizatorul consumurilor pe gestiuni",
            perioada: `${dataStart ? new Date(dataStart).toLocaleDateString('ro-RO') : ''} - ${dataEnd ? new Date(dataEnd).toLocaleDateString('ro-RO') : ''}`,
            gestiuni: gestiuniArray,
            totalGeneral: Number(totalGeneral)
        };

        return NextResponse.json(rezultat, { status: 200 });
    } catch (error) {
        console.error("Eroare la generarea raportului de consum:", error);
        return NextResponse.json(
            { error: "Eroare la generarea raportului de consum" },
            { status: 500 }
        );
    }
}