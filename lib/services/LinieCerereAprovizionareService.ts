// lib/services/LinieCerereAprovizionareService.ts

import { PrismaClient } from "@prisma/client";
import { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare";

const prisma = new PrismaClient();

export class LinieCerereAprovizionareService {
    async getById(id: number): Promise<LinieCerereAprovizionare> {
        const linie = await prisma.linieCerereAprovizionare.findUnique({
            where: { id },
            include: { bun: true }
        });
        if (!linie) throw new Error("Linie cerere inexistentă.");
        return LinieCerereAprovizionare.fromPrisma(linie);
    }

    async updateLinie(id: number, data: any): Promise<LinieCerereAprovizionare> {
        const updated = await prisma.linieCerereAprovizionare.update({
            where: { id },
            data: {
                cantitate: Number(data.cantitate),
                valoare: Number(data.valoare),
                observatii: data.observatii ?? null
            },
            include: { bun: true }
        });
        return LinieCerereAprovizionare.fromPrisma(updated);
    }

    async deleteLinie(id: number): Promise<void> {
        await prisma.linieCerereAprovizionare.delete({ where: { id } });
    }
}
