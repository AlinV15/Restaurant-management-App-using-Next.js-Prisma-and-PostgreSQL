import { Gestiune } from "./Gestiune";

/**
 * Clasa pentru rapoartele de consum centralizate
 */
export class RaportConsum {
    private titlu: string;
    private perioada: string;
    private gestiuni: Gestiune[];
    private totalGeneral: number;

    constructor(
        titlu: string,
        perioada: string,
        gestiuni: Gestiune[],
        totalGeneral: number
    ) {
        this.titlu = titlu;
        this.perioada = perioada;
        this.gestiuni = gestiuni;
        this.totalGeneral = totalGeneral;
    }

    getTitlu(): string {
        return this.titlu;
    }

    getPerioada(): string {
        return this.perioada;
    }

    getGestiuni(): Gestiune[] {
        return this.gestiuni;
    }

    getTotalGeneral(): number {
        return this.totalGeneral;
    }

    areData(): boolean {
        return this.gestiuni.length > 0;
    }

    getTotaluriGeneraleBunuri(): Record<number, number> {
        const totaluri: Record<number, number> = {};

        for (const gestiune of this.gestiuni) {
            const totaluriGestiune = gestiune.getTotaluriBunuri();

            for (const [idBun, total] of Object.entries(totaluriGestiune)) {
                const id = Number(idBun);
                if (!totaluri[id]) {
                    totaluri[id] = 0;
                }
                totaluri[id] += total;
            }
        }

        return totaluri;
    }

    getCantitatiGeneraleBunuri(): Record<number, number> {
        const cantitati: Record<number, number> = {};

        for (const gestiune of this.gestiuni) {
            const cantitatiGestiune = gestiune.getCantitatiTotaleBunuri();

            for (const [idBun, cantitate] of Object.entries(cantitatiGestiune)) {
                const id = Number(idBun);
                if (!cantitati[id]) {
                    cantitati[id] = 0;
                }
                cantitati[id] += cantitate;
            }
        }

        return cantitati;
    }

    toJson(): any {
        return {
            titlu: this.titlu,
            perioada: this.perioada,
            gestiuni: this.gestiuni.map(g => g.toJson()),
            totalGeneral: this.totalGeneral
        };
    }
}