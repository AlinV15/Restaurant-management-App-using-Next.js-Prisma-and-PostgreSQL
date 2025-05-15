export class Bun {
    constructor(
        public id_bun: number,
        public nume_bun: string,
        public cantitate_disponibila: number,
        public pret_unitar: number,
        public unitate_masura: string,
        public data_expirare?: Date
    ) { }

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
}