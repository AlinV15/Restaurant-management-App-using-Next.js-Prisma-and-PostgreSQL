// lib/services/AngajatService.ts

import { PrismaClient } from "@prisma/client";
import { Angajat } from "@/lib/classes/Angajat";

const prisma = new PrismaClient();

export class AngajatService {
    async getById(id: number): Promise<Angajat> {
        const angajat = await prisma.angajati.findUnique({ where: { id_angajat: id } });
        if (!angajat) throw new Error("Angajat inexistent.");
        return Angajat.fromPrisma(angajat);
    }

    async getAll(): Promise<Angajat[]> {
        const angajati = await prisma.angajati.findMany({ orderBy: { id_angajat: "asc" } });
        return angajati.map(Angajat.fromPrisma);
    }

    async createAngajat(data: any): Promise<Angajat> {
        const created = await prisma.angajati.create({
            data: {
                nume_angajat: data.nume_angajat,
                prenume_angajat: data.prenume_angajat,
                functie: data.functie,
                telefon: data.telefon,
                email: data.email,
                data_angajare: new Date(data.data_angajare)
            }
        });
        return Angajat.fromPrisma(created);
    }

    async updateAngajat(id: number, data: any): Promise<Angajat> {
        const updated = await prisma.angajati.update({
            where: { id_angajat: id },
            data: {
                nume_angajat: data.nume_angajat,
                prenume_angajat: data.prenume_angajat,
                functie: data.functie,
                telefon: data.telefon,
                email: data.email,
                data_angajare: new Date(data.data_angajare)
            }
        });
        return Angajat.fromPrisma(updated);
    }

    async deleteAngajat(id: number): Promise<void> {
        await prisma.angajati.delete({ where: { id_angajat: id } });
    }
}
