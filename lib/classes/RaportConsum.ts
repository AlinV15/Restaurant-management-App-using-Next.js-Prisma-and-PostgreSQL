import { Gestiune } from "./Gestiune";

/**
 * Clasa pentru rapoartele de consum centralizate
 */
export class RaportConsum {
    private titlu: string;
    private perioada: string;
    private gestiuni: Gestiune[];
    private totalGeneral: number;

    /**
     * Constructor pentru raportul de consum
     * @param titlu Titlul raportului
     * @param perioada Perioada acoperită de raport (format string)
     * @param gestiuni Lista de gestiuni incluse în raport
     * @param totalGeneral Totalul general al valorii consumurilor
     */
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

    /**
     * Obține titlul raportului
     * @returns Titlul raportului
     */
    getTitlu(): string {
        return this.titlu;
    }

    /**
     * Obține perioada raportului
     * @returns Perioada raportului ca string
     */
    getPerioada(): string {
        return this.perioada;
    }

    /**
     * Obține gestiunile incluse în raport
     * @returns Lista de gestiuni
     */
    getGestiuni(): Gestiune[] {
        return this.gestiuni;
    }

    /**
     * Obține totalul general al valorii consumurilor
     * @returns Valoarea totală a consumurilor
     */
    getTotalGeneral(): number {
        return this.totalGeneral;
    }

    /**
     * Verifică dacă raportul conține date
     * @returns true dacă raportul conține cel puțin o gestiune, false altfel
     */
    areData(): boolean {
        return this.gestiuni.length > 0;
    }

    /**
     * Obține o mapare a totalurilor pentru fiecare bun pe toate gestiunile
     * @returns Un obiect care mapează ID-ul bunului la totalul consumat în toate gestiunile
     */
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

    /**
     * Obține o mapare a cantităților totale pentru fiecare bun pe toate gestiunile
     * @returns Un obiect care mapează ID-ul bunului la cantitatea totală consumată în toate gestiunile
     */
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
}