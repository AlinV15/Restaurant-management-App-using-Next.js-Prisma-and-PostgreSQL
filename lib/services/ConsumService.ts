// lib/services/ConsumService.ts

import { PrismaClient } from "@prisma/client";
import { Consum } from "@/lib/classes/Consum";
import { LinieConsum } from "@/lib/classes/LinieConsum";

const prisma = new PrismaClient();

export class ConsumService {
    async creeazaConsum(data: any): Promise<Consum> {
        return await prisma.$transaction(async (tx) => {
            if (!data || !data.id_gestiune || !data.linii || !Array.isArray(data.linii)) {
                throw new Error("Datele pentru consum sunt invalide.");
            }

            const valoareTotala = data.linii.reduce(
                (acc: number, linie: any) => acc + Number(linie.valoare || 0),
                0
            );

            const document = await tx.document.create({ data: { data: new Date() } });

            const consumDB = await tx.consum.create({
                data: {
                    nr_document: document.nr_document,
                    id_gestiune: data.id_gestiune,
                    id_sef: data.id_sef ?? null,
                    valoare: valoareTotala,
                    data: new Date()
                }
            });

            for (const linie of data.linii) {
                await tx.linieConsum.create({
                    data: {
                        id_consum: consumDB.nr_document,
                        id_bun: linie.id_bun,
                        cantitate_necesara: linie.cantitate_necesara,
                        cant_eliberata: linie.cant_eliberata,
                        valoare: linie.valoare
                    }
                });

                await tx.bun.update({
                    where: { id_bun: linie.id_bun },
                    data: { cantitate_disponibila: { decrement: linie.cant_eliberata } }
                });

                await tx.stoc.updateMany({
                    where: {
                        id_bun: linie.id_bun,
                        id_gestiune: data.id_gestiune
                    },
                    data: { stoc_actual: { decrement: linie.cant_eliberata } }
                });
            }

            const created = await tx.consum.findUnique({
                where: { nr_document: consumDB.nr_document },
                include: {
                    sef: true,
                    gestiune: true,
                    liniiConsum: { include: { bun: true } }
                }
            });

            if (!created) throw new Error("Eroare la creare consum.");
            return Consum.fromPrisma(created);
        });
    }

    async updateConsum(id: number, data: any): Promise<Consum> {
        return await prisma.$transaction(async (tx) => {
            const existent = await tx.consum.findUnique({
                where: { nr_document: id },
                include: { liniiConsum: true }
            });

            if (!existent) throw new Error("Consum inexistent.");

            const valoareTotala = data.linii.reduce(
                (acc: number, linie: any) => acc + Number(linie.valoare || 0),
                0
            );

            for (const linie of existent.liniiConsum) {
                await tx.bun.update({
                    where: { id_bun: linie.id_bun },
                    data: { cantitate_disponibila: { increment: linie.cant_eliberata } }
                });

                await tx.stoc.updateMany({
                    where: { id_bun: linie.id_bun, id_gestiune: existent.id_gestiune },
                    data: { stoc_actual: { increment: linie.cant_eliberata } }
                });
            }

            await tx.linieConsum.deleteMany({ where: { id_consum: id } });

            for (const linie of data.linii) {
                await tx.linieConsum.create({
                    data: {
                        id_consum: id,
                        id_bun: linie.id_bun,
                        cantitate_necesara: linie.cantitate_necesara,
                        cant_eliberata: linie.cant_eliberata,
                        valoare: linie.valoare
                    }
                });

                await tx.bun.update({
                    where: { id_bun: linie.id_bun },
                    data: { cantitate_disponibila: { decrement: linie.cant_eliberata } }
                });

                await tx.stoc.updateMany({
                    where: { id_bun: linie.id_bun, id_gestiune: data.id_gestiune },
                    data: { stoc_actual: { decrement: linie.cant_eliberata } }
                });
            }

            await tx.consum.update({
                where: { nr_document: id },
                data: {
                    id_gestiune: data.id_gestiune,
                    id_sef: data.id_sef ?? null,
                    valoare: valoareTotala,
                    data: new Date()
                }
            });

            const updated = await tx.consum.findUnique({
                where: { nr_document: id },
                include: {
                    sef: true,
                    gestiune: true,
                    liniiConsum: { include: { bun: true } }
                }
            });

            if (!updated) throw new Error("Eroare la actualizare consum.");
            return Consum.fromPrisma(updated);
        });
    }

    async stergeConsum(id: number): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const consum = await tx.consum.findUnique({
                where: { nr_document: id },
                include: { liniiConsum: true }
            });

            if (!consum) throw new Error("Consum inexistent.");

            for (const linie of consum.liniiConsum) {
                await tx.bun.update({
                    where: { id_bun: linie.id_bun },
                    data: { cantitate_disponibila: { increment: linie.cant_eliberata } }
                });

                await tx.stoc.updateMany({
                    where: { id_bun: linie.id_bun, id_gestiune: consum.id_gestiune },
                    data: { stoc_actual: { increment: linie.cant_eliberata } }
                });
            }

            await tx.linieConsum.deleteMany({ where: { id_consum: id } });
            await tx.consum.delete({ where: { nr_document: id } });
            await tx.document.delete({ where: { nr_document: id } });
        });
    }

    async getById(id: number): Promise<Consum> {
        const consum = await prisma.consum.findUnique({
            where: { nr_document: id },
            include: {
                sef: true,
                gestiune: true,
                liniiConsum: { include: { bun: true } }
            }
        });

        if (!consum) throw new Error("Consum inexistent.");
        return Consum.fromPrisma(consum);
    }

    async getAll(): Promise<Consum[]> {
        const consumuri = await prisma.consum.findMany({
            include: {
                sef: true,
                gestiune: true,
                liniiConsum: { include: { bun: true } },
                document: true
            },
            orderBy: {
                document: { data: "desc" }
            }
        });

        return consumuri.map(Consum.fromPrisma);
    }
}