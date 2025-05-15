import { Bun } from "./Bun"

export class BunLinie extends Bun {
    constructor(
        public id_bun: number,
        public nume_bun: string,
        public cantitate_disponibila: number,
        public pret_unitar: number,
        public unitate_masura: string,
        public cantitate_necesara: number,
        public data_expirare?: Date,

    ) {
        super(id_bun, nume_bun, cantitate_disponibila, pret_unitar, unitate_masura, data_expirare)
    }
}