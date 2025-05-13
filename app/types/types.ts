//import { Decimal } from "@prisma/client/runtime/library";

export interface Bun {
    id_linie_cerere?: number;
    id_bun: number;
    nume_bun: string;
    cantitate_disponibila: number;
    pret_unitar: number;
    data_expirare: Date;
    unitate_masura: string;
    observatii: string;
}

export interface LinieConsum {
    id_linie_consum?: number;
    id_bun: number;
    cantitate_necesara: number;
    cant_eliberata: number;
    valoare: number;
    bun: Bun;
}
export interface BunInsuficient {
    id_bun: number;
    nume_bun: string;
    cantitate_disponibila: number | string;
    cantitate_necesara: number | string;
}


export interface Consum {
    id_consum: number,
    valoare: number,
    data: Date,
    id_sef: number,  // Modificat pentru a reflecta structura înainte de JOIN
    id_gestiune: number,  // Modificat pentru a reflecta structura înainte de JOIN
    sef?: Angajat,  // Opțional, dacă relația nu este încărcată
    gestiune?: Gestiune  // Opțional, dacă relația nu este încărcată
    liniiConsum?: LinieConsum[]
}

// Interfețe pentru modelele de date
export interface Angajat {
    id_angajat: number;
    nume_angajat: string;
    prenume_angajat: string;
    functie: string;
}

export interface Gestiune {
    id_gestiune: number;
    denumire: string;
    id_gestionar: number;
}



// Adăugat proprietățile lipsă
export interface BunCerere {
    id_linie_cerere?: number; // Adăugat proprietatea lipsă
    id_bun: number;
    nume_bun: string;
    cantitate: number;
    unitate_masura?: string;
    pret_unitar?: number | string;
    observatii?: string; // Adăugat proprietatea lipsă
}

// Adăugat interfața pentru cerere
export interface CerereAprovizionare {
    id_cerere: number;
    id_gestiune: number;
    data: string | Date;
    valoare: number;
    status: string;
}
