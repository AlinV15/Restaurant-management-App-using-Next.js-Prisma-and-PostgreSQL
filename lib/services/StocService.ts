// lib/services/StocService.ts

import { PrismaClient } from "@prisma/client";
import { Stoc } from "@/lib/classes/Stoc";

const prisma = new PrismaClient();

export class StocService {
    async getById(id: number): Promise<Stoc> {
        const stoc = await prisma.stoc.findUnique({
            where: { id_stoc: id },
            include: { bun: true, gestiune: true }
        });
        if (!stoc) throw new Error("Stoc inexistent.");
        return Stoc.fromPrisma(stoc);
    }

    async getAll(): Promise<Stoc[]> {
        const stocuri = await prisma.stoc.findMany({
            include: { bun: true, gestiune: true },
            orderBy: { id_stoc: "asc" }
        });
        return stocuri.map(Stoc.fromPrisma);
    }

    async updateStoc(id: number, data: any): Promise<Stoc> {
        const updated = await prisma.stoc.update({
            where: { id_stoc: id },
            data: {
                stoc_actual: data.stoc_actual,
                stoc_init_lunar: data.stoc_init_lunar,
                prag_minim: data.prag_minim,
                cantitate_optima: data.cantitate_optima
            }
        });
        return Stoc.fromPrisma(updated);
    }

    async getByGestiune(idGestiune: number): Promise<Stoc[]> {
        const stocuri = await prisma.stoc.findMany({
            where: { id_gestiune: idGestiune },
            include: { bun: true },
            orderBy: { id_stoc: "asc" }
        });
        return stocuri.map(Stoc.fromPrisma);
    }
}
