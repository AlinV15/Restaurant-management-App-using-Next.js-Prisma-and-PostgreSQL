import { NextResponse } from "next/server"

export class Bun {
    constructor(
        private id_bun: number,
        private nume_bun: string,
        private cantitate_disponibila: number,
        private pret_unitar: number,
        private unitate_masura: string,
        private data_expirare?: Date
    ) { }

    //getteri
    public getId() {
        return this.id_bun
    }

    public getNume() {
        return this.id_bun
    }

    public getCantitateDisponibila() {
        return this.cantitate_disponibila
    }

    public getPretUnitar() {
        return this.pret_unitar
    }

    public getUM() {
        return this.unitate_masura
    }

    public getDataExp() {
        return this.data_expirare
    }

    //setteri
    public setNume(nume: string) {
        this.nume_bun = nume
    }
    public setCantitateDisponibila(qty: number) {
        this.cantitate_disponibila = qty
    }

    public setPretUnitar(pret: number) {
        this.pret_unitar = pret
    }

    public setUM(um: string) {
        this.unitate_masura = um
    }

    public setDataExp(data: Date) {
        this.data_expirare = data
    }



    static placeholder(id: number): Bun {
        return new Bun(id, "Necunoscut", 0, 0, "");
    }

    toJson(): any {
        return {
            id_bun: this.id_bun,
            nume_bun: this.nume_bun,
            cantitate_disponibila: this.cantitate_disponibila,
            pret_unitar: this.pret_unitar,
            unitate_masura: this.unitate_masura,
            data_expirare: this.data_expirare?.toISOString() ?? null
        };
    }

    static fromApi(data: any): Bun {
        return new Bun(
            data.id_bun ?? data.id,
            data.nume_bun ?? data.nume,
            Number(data.cantitate_disponibila),
            Number(data.pret_unitar),
            data.unitate_masura,
            data.data_expirare ? new Date(data.data_expirare) : undefined
        );
    }

    getTotalValue(): number {
        return this.pret_unitar * this.cantitate_disponibila;
    }
    esteExpirat(): boolean {
        if (!this.data_expirare) return false;
        return new Date(this.data_expirare) < new Date();
    }

    static fromPrisma(bun: any): Bun {
        return new Bun(
            bun.id_bun,
            bun.nume_bun,
            Number(bun.cantitate_disponibila),
            Number(bun.pret_unitar),
            bun.unitate_masura,
            bun.data_expirare ? new Date(bun.data_expirare) : undefined
        );
    }

    static async createBun(data: any, prisma: any) {
        const { nume_bun, cantitate_disponibila, pret_unitar, data_expirare, unitate_masura } = data;

        if (!nume_bun || !cantitate_disponibila || !pret_unitar || !data_expirare || !unitate_masura) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const bunul = await prisma.bun.create({
            data: {
                nume_bun,
                cantitate_disponibila,
                pret_unitar,
                data_expirare: data_expirare ? new Date(data_expirare) : null,
                unitate_masura
            }
        });
        console.log('Bunul a fost adaugat cu succes!');
        return bunul;
    }

    static async actualizareBun(data: any, idNumeric: number, prisma: any) {
        const { nume_bun, cantitate_disponibila, pret_unitar, data_expirare, unitate_masura } = data;

        if (!nume_bun || !cantitate_disponibila || !pret_unitar || !data_expirare || !unitate_masura) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const existingBun = await prisma.bun.findUnique({
            where: { id_bun: idNumeric },
        });

        if (!existingBun) {
            return NextResponse.json({ error: 'Bunul nu a fost gasit' }, { status: 404 });

        }
        const updatedBun = await prisma.bun.update({
            where: { id_bun: idNumeric },
            data: {
                nume_bun,
                cantitate_disponibila,
                pret_unitar,
                data_expirare: data_expirare ? new Date(data_expirare) : null,
                unitate_masura
            }
        });


        if (!prisma.stoc.findMany({ where: { id_bun: idNumeric } })) { } else {
            await prisma.stoc.updateMany({
                where: { id_bun: idNumeric },
                data: {
                    stoc_actual: cantitate_disponibila,
                }
            });

            const dateOfAnalysis = new Date().getDay();
            if (dateOfAnalysis === 1) {
                await prisma.stoc.updateMany({
                    where: { id_bun: idNumeric },
                    data: {
                        stoc_init_lunar: cantitate_disponibila,
                    }
                });
            }
        }
        console.log('Bunul a fost actualizat cu succes!');
        return updatedBun;
    }

    static async deleteBun(id: string, prisma: any) {
        const idNumeric = parseInt(id);
        if (!idNumeric) {
            return NextResponse.json({ error: 'Bunul nu a fost gasit' }, { status: 404 });
        }
        const existingBun = await prisma.bun.findUnique({
            where: { id_bun: idNumeric },
        });
        if (!existingBun) {
            return NextResponse.json({ error: 'Bunul nu a fost gasit' }, { status: 404 });
        }
        await prisma.stoc.deleteMany({
            where: { id_bun: idNumeric },
        });
        await prisma.bun.delete({
            where: { id_bun: idNumeric },
        });


        console.log('Bunul a fost sters cu succes!');
    }
}