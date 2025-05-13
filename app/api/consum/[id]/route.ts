import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params;
        const body = await req.json();
        const { id_sef, id_gestiune, data, linii } = body;

        if (!id_sef || !id_gestiune || !linii || !data || !Array.isArray(linii) || linii.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        return await prisma.$transaction(async (tx) => {
            const consum = await tx.consum.findUnique({
                where: { id_consum: Number(id) }
            });

            if (!consum) {
                return NextResponse.json({ error: "Consum not found" }, { status: 404 });
            }

            let valoareTotala = 0;

            const liniiExistente = await tx.linieConsum.findMany({
                where: { id_consum: Number(id) }
            });

            for (const linie of liniiExistente) {
                await tx.bun.update({
                    where: { id_bun: linie.id_bun },
                    data: { cantitate_disponibila: { increment: linie.cant_eliberata } }
                });

                await tx.stoc.updateMany({
                    where: { id_bun: linie.id_bun, id_gestiune: consum.id_gestiune },
                    data: { stoc_actual: { increment: linie.cant_eliberata } }
                });
            }

            await tx.linieConsum.deleteMany({
                where: { id_consum: Number(id) }
            });

            const liniiCreated = [];
            const cereriAprovizionare = new Map();

            for (const linie of linii) {
                const { id_bun, cantitate_necesara, cant_eliberata } = linie;

                if (!id_bun || !cantitate_necesara || !cant_eliberata) {
                    throw new Error(`Linia de consum pentru bunul ${id_bun} are câmpuri lipsă`);
                }

                const bun = await tx.bun.findUnique({
                    where: { id_bun: Number(id_bun) }
                });

                if (!bun) {
                    throw new Error(`Bunul cu ID-ul ${id_bun} nu a fost găsit`);
                }

                const stoc = await tx.stoc.findFirst({
                    where: { id_bun: Number(id_bun), id_gestiune: Number(id_gestiune) }
                });

                if (!stoc) {
                    throw new Error(`Nu există bunul înregistrat în stoc pentru gestiunea specificată`);
                }

                if (cant_eliberata > Number(bun.cantitate_disponibila)) {
                    let cerereId;

                    if (!cereriAprovizionare.has(Number(id_gestiune))) {
                        const documentCerere = await tx.document.create({
                            data: { data: new Date() }
                        });

                        const cerereNoua = await tx.cerereAprovizionare.create({
                            data: {
                                id_cerere: documentCerere.nr_document,
                                id_gestiune: Number(id_gestiune),
                                data: new Date(),
                                valoare: 0,
                            }
                        });

                        cerereId = cerereNoua.id_cerere;
                        cereriAprovizionare.set(Number(id_gestiune), cerereId);
                    } else {
                        cerereId = cereriAprovizionare.get(Number(id_gestiune));
                    }

                    const cantitateNecesara = stoc.cantitate_optima || (cant_eliberata - Number(bun.cantitate_disponibila)) * 2;
                    const valoareLinieCerere = Number(bun.pret_unitar) * Number(cantitateNecesara);

                    await tx.linieCerereAprovizionare.create({
                        data: {
                            id_cerere: cerereId,
                            id_bun: bun.id_bun,
                            cantitate: cantitateNecesara,
                            valoare: valoareLinieCerere,
                            observatii: "Cerere de aprovizionare automată"
                        }
                    });

                    await tx.cerereAprovizionare.update({
                        where: { id_cerere: cerereId },
                        data: { valoare: { increment: valoareLinieCerere } }
                    });

                    throw new Error(`Cantitate insuficientă pentru bunul ${bun.nume_bun}. Cerere de aprovizionare a fost creată.`);
                }

                await tx.bun.update({
                    where: { id_bun: Number(id_bun) },
                    data: { cantitate_disponibila: { decrement: cant_eliberata } }
                });

                await tx.stoc.updateMany({
                    where: { id_bun: Number(id_bun), id_gestiune: Number(id_gestiune) },
                    data: { stoc_actual: { decrement: cant_eliberata } }
                });

                const valoareLinie = Number(bun.pret_unitar) * Number(cant_eliberata);
                valoareTotala += valoareLinie;

                const linieConsum = await tx.linieConsum.create({
                    data: {
                        id_bun: Number(id_bun),
                        id_consum: Number(id),
                        cantitate_necesara: Number(cantitate_necesara),
                        cant_eliberata: Number(cant_eliberata),
                        valoare: valoareLinie
                    },
                    include: { bun: true }
                });

                liniiCreated.push(linieConsum);
            }

            const consumActualizat = await tx.consum.update({
                where: { id_consum: Number(id) },
                data: {
                    valoare: valoareTotala,
                    id_sef: Number(id_sef),
                    id_gestiune: Number(id_gestiune),
                    data: data ? new Date(data) : new Date()
                }
            });

            return NextResponse.json({
                consum: consumActualizat,
                linii: liniiCreated,
                message: "Consum actualizat cu succes"
            }, { status: 200 });
        });

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Error updating consum";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;

        const consumVechi = await prisma.consum.findUnique({
            where: { id_consum: parseInt(id) },
        });

        if (!consumVechi) {
            return NextResponse.json({ error: "Consum not found" }, { status: 404 });
        }

        const liniiConsum = await prisma.linieConsum.findMany({
            where: { id_consum: parseInt(id) }
        })

        if (liniiConsum.length > 0) {

            for (const linie of liniiConsum) {
                const id_bun = linie.id_bun;

                await prisma.linieConsum.delete({
                    where: { id_linie_consum: linie.id_linie_consum }
                })

                await prisma.bun.update({
                    where: { id_bun: id_bun },
                    data: {
                        cantitate_disponibila: {
                            increment: linie.cant_eliberata
                        }
                    }
                })

                await prisma.stoc.updateMany({
                    where: {
                        id_bun: id_bun,
                        id_gestiune: consumVechi.id_gestiune
                    },
                    data: {
                        stoc_actual: {
                            increment: linie.cant_eliberata
                        }
                    }
                })
            }

        }

        const consum = await prisma.consum.delete({
            where: { id_consum: parseInt(id) },
        });


        await prisma.document.delete({
            where: { nr_document: parseInt(id) },
        });
        return NextResponse.json(consum, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error deleting data" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    const { id } = await context.params;
    if (id === undefined) {
        return NextResponse.json({ error: 'The id not found' }, { status: 404 })
    }
    try {

        const consum = await prisma.consum.findUnique({
            where: { id_consum: parseInt(id) },
            include: {
                gestiune: true,
                sef: true,
                liniiConsum: {

                    include: {
                        bun: true
                    }
                }
            }
        })
        return NextResponse.json(consum, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error getting data" }, { status: 500 });
    }

}