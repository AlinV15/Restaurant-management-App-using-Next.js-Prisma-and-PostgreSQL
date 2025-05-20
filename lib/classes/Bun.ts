// lib/classes/Bun.ts

export class Bun {
    constructor(
        private id_bun: number,
        private nume_bun: string,
        private cantitate_disponibila: number,
        private pret_unitar: number,
        private unitate_masura: string,
        private data_expirare?: Date
    ) { }

    // Getters
    getId(): number {
        return this.id_bun;
    }

    getNume(): string {
        return this.nume_bun;
    }

    getCantitateDisponibila(): number {
        return this.cantitate_disponibila;
    }

    getPretUnitar(): number {
        return this.pret_unitar;
    }

    getUM(): string {
        return this.unitate_masura;
    }

    getDataExp(): Date | undefined {
        return this.data_expirare;
    }

    // Setters
    setNume(nume: string): void {
        this.nume_bun = nume;
    }

    setCantitateDisponibila(qty: number): void {
        this.cantitate_disponibila = qty;
    }

    setPretUnitar(pret: number): void {
        this.pret_unitar = pret;
    }

    setUM(um: string): void {
        this.unitate_masura = um;
    }

    setDataExp(data: Date): void {
        this.data_expirare = data;
    }

    // Business logic
    scadeStoc(cantitate: number): void {
        this.cantitate_disponibila -= cantitate;
    }

    verificaDisponibilitate(cantitate: number): boolean {
        return this.cantitate_disponibila >= cantitate;
    }

    esteExpirat(): boolean {
        if (!this.data_expirare) return false;
        return new Date(this.data_expirare) < new Date();
    }

    getTotalValue(): number {
        return this.pret_unitar * this.cantitate_disponibila;
    }

    // Static utility
    static placeholder(id: number): Bun {
        return new Bun(id, "Necunoscut", 0, 0, "");
    }

    // Conversion
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
}
