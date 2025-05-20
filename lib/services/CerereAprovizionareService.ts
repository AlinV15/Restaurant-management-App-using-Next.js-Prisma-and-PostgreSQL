// lib/services/CerereAprovizionareService.ts

import { PrismaClient } from "@prisma/client";
import { CerereAprovizionare, StatusCerere } from "@/lib/classes/CerereAprovizionare";
import { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare";
import { mapToPrismaStatus } from "@/app/utils/statusMapper"

const prisma = new PrismaClient();

export class CerereAprovizionareService {
    async creeazaCerere(data: any): Promise<CerereAprovizionare> {
        return await prisma.$transaction(async (tx) => {
            const document = await tx.document.create({ data: { data: new Date() } });

            const cerereDB = await tx.cerereAprovizionare.create({
                data: {
                    nr_document: document.nr_document,
                    id_gestiune: data.id_gestiune,
                    valoare: Number(data.valoare),
                    status: data.status || StatusCerere.IN_ASTEPTARE,
                    data: new Date()
                }
            });

            for (const linie of data.linii) {
                await tx.linieCerereAprovizionare.create({
                    data: {
                        id_cerere: cerereDB.nr_document,
                        id_bun: linie.id_bun,
                        cantitate: linie.cantitate,
                        valoare: linie.valoare,
                        observatii: linie.observatii ?? null
                    }
                });
            }

            const created = await tx.cerereAprovizionare.findUnique({
                where: { nr_document: cerereDB.nr_document },
                include: {
                    gestiune: true,
                    liniiCerere: { include: { bun: true } }
                }
            });

            if (!created) throw new Error("Eroare la creare cerere.");
            return CerereAprovizionare.fromPrisma(created);
        });
    }

    async getById(id: number): Promise<CerereAprovizionare> {
        const cerere = await prisma.cerereAprovizionare.findUnique({
            where: { nr_document: id },
            include: {
                gestiune: true,
                liniiCerere: { include: { bun: true } }
            }
        });
        if (!cerere) throw new Error("Cerere inexistentă.");
        return CerereAprovizionare.fromPrisma(cerere);
    }

    async getAll(): Promise<CerereAprovizionare[]> {
        const cereri = await prisma.cerereAprovizionare.findMany({
            include: {
                gestiune: true,
                liniiCerere: { include: { bun: true } },
                document: true
            },
            orderBy: {
                document: { data: "desc" }
            }
        });
        return cereri.map(CerereAprovizionare.fromPrisma);
    }

    async schimbaStatus(id: number, status: any): Promise<void> {
        await prisma.cerereAprovizionare.update({
            where: { nr_document: id },
            data: { status }
        });
    }

    async stergeCerere(id: number): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await tx.linieCerereAprovizionare.deleteMany({ where: { id_cerere: id } });
            await tx.cerereAprovizionare.delete({ where: { nr_document: id } });
            await tx.document.delete({ where: { nr_document: id } });
        });
    }
}