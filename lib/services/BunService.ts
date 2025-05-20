// lib/services/BunService.ts

import prisma from "@/lib/prisma"
import { Bun } from "@/lib/classes/Bun";


export class BunService {
    async createBun(data: any): Promise<Bun> {
        const created = await prisma.bun.create({
            data: {
                nume_bun: data.nume_bun,
                cantitate_disponibila: Number(data.cantitate_disponibila),
                pret_unitar: Number(data.pret_unitar),
                data_expirare: data.data_expirare ? new Date(data.data_expirare) : undefined,
                unitate_masura: data.unitate_masura
            }
        });
        return Bun.fromPrisma(created);
    }

    async updateBun(id: number, data: any): Promise<Bun> {
        const updated = await prisma.bun.update({
            where: { id_bun: id },
            data: {
                nume_bun: data.nume_bun,
                cantitate_disponibila: Number(data.cantitate_disponibila),
                pret_unitar: Number(data.pret_unitar),
                data_expirare: data.data_expirare ? new Date(data.data_expirare) : undefined,
                unitate_masura: data.unitate_masura
            }
        });
        return Bun.fromPrisma(updated);
    }

    async deleteBun(id: number): Promise<void> {
        await prisma.bun.delete({ where: { id_bun: id } });
    }

    async getById(id: number): Promise<Bun> {
        const bun = await prisma.bun.findUnique({ where: { id_bun: id } });
        if (!bun) throw new Error("Bun inexistent.");
        return Bun.fromPrisma(bun);
    }

    async getAll(): Promise<Bun[]> {
        const bunuri = await prisma.bun.findMany();
        return bunuri.map(Bun.fromPrisma);
    }
}
