import { Bun } from './Bun';

export class LinieConsumForm {
    constructor(
        public id_bun: number,
        public nume_bun: string,
        public cantitate_necesara: number,
        public um: string,
        public cantitate_eliberata: number,
        public pret_unitar: number
    ) { }

    get valoare(): number {
        return this.cantitate_eliberata * this.pret_unitar;
    }

    static fromBun(bun: Bun, cantNecesara: string, cantEliberata: string): LinieConsumForm {
        const cantNec = parseFloat(cantNecesara);
        const cantElib = parseFloat(cantEliberata);
        const pret = typeof bun.pret_unitar === 'string' ? parseFloat(bun.pret_unitar) : bun.pret_unitar;

        return new LinieConsumForm(
            bun.id_bun,
            bun.nume_bun,
            cantNec,
            bun.unitate_masura,
            cantElib,
            pret
        );
    }
}
