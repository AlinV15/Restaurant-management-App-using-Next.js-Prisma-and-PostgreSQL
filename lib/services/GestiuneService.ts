// lib/services/GestiuneService.ts

import { PrismaClient } from "@prisma/client";
import { Gestiune } from "@/lib/classes/Gestiune";

const prisma = new PrismaClient();

export class GestiuneService {
    async getById(id: number): Promise<Gestiune> {
        const gest = await prisma.gestiune.findUnique({ where: { id_gestiune: id }, include: { angajatRelation: true } });
        if (!gest) throw new Error("Gestiune inexistentă.");
        return Gestiune.fromPrisma(gest);
    }

    async getAll(): Promise<Gestiune[]> {
        const gestiuni = await prisma.gestiune.findMany({ orderBy: { id_gestiune: "asc" }, include: { angajatRelation: true } });
        return gestiuni.map(Gestiune.fromPrisma);
    }

    async createGestiune(data: any): Promise<Gestiune> {
        const created = await prisma.gestiune.create({
            data: {
                denumire: data.denumire,
                id_gestionar: data.id_gestionar ?? null
            }
        });
        return Gestiune.fromPrisma(created);
    }

    async updateGestiune(id: number, data: any): Promise<Gestiune> {
        const updated = await prisma.gestiune.update({
            where: { id_gestiune: id },
            data: {
                denumire: data.denumire,
                id_gestionar: data.id_gestionar ?? null
            }
        });
        return Gestiune.fromPrisma(updated);
    }

    async deleteGestiune(id: number): Promise<void> {
        await prisma.gestiune.delete({ where: { id_gestiune: id } });
    }
}