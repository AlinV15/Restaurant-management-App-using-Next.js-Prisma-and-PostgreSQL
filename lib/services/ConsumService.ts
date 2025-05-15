import { LinieConsumForm } from '../classes/LinieConsumForm';

export class ConsumService {
    static calcTotalValoare(linii: LinieConsumForm[]) {
        return linii.reduce((acc, linie) => acc + linie.valoare, 0);
    }

    static calcTotalCantitate(linii: LinieConsumForm[]) {
        return linii.reduce((acc, linie) => acc + linie.cantitate_eliberata, 0);
    }

    static hasCantitateInsuficienta(linie: LinieConsumForm, cantDisponibila: number): boolean {
        return linie.cantitate_eliberata > cantDisponibila;
    }

    static toApiPayload(
        gestiuneId: number,
        sefId: number,
        data: string,
        linii: LinieConsumForm[]
    ) {
        return {
            id_gestiune: gestiuneId,
            id_sef: sefId,
            data,
            linii: linii.map(l => ({
                id_bun: l.id_bun,
                cantitate_necesara: l.cantitate_necesara,
                cant_eliberata: l.cantitate_eliberata,
            }))
        };
    }
}
