import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LinieConsumService {
    async deleteLinie(id: number): Promise<void> {
        await prisma.linieConsum.delete({ where: { id_linie_consum: id } });
    }

    async getById(id: number) {
        return await prisma.linieConsum.findUnique({
            where: { id_linie_consum: id },
            include: { bun: true, consum: true }
        });
    }
}