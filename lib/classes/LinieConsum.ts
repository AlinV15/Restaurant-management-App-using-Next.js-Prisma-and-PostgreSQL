
import { Bun } from "./Bun";

export class LinieConsum {
  private bun?: Bun;

  constructor(
    private id_linie_consum: number | null,
    private id_consum: number | null,
    private id_bun: number,
    private cantitate_necesara: number,
    private valoare: number,
    private cant_eliberata: number
  ) { }

  // Static constructor from Bun
  static fromBun(bun: Bun, cantitateNec: number, cantitateElib: number): LinieConsum {
    const valoare = bun.getPretUnitar() * cantitateElib;
    const linie = new LinieConsum(
      null,
      null,
      bun.getId(),
      cantitateNec,
      valoare,
      cantitateElib
    );
    linie.setBun(bun);
    return linie;
  }

  // Getters
  getId(): number | null {
    return this.id_linie_consum;
  }

  getIdConsum(): number | null {
    return this.id_consum;
  }

  getIdBun(): number {
    return this.id_bun;
  }

  getCantitateNecesara(): number {
    return this.cantitate_necesara;
  }

  getCantitateEliberata(): number {
    return this.cant_eliberata;
  }

  getValoare(): number {
    return this.valoare;
  }

  getBun(): Bun | undefined {
    return this.bun;
  }

  // Setters
  setCantitateNecesara(qtyNec: number): void {
    this.cantitate_necesara = qtyNec;
  }

  setCantitateEliberata(qtyElib: number): void {
    this.cant_eliberata = qtyElib;
  }

  setValoare(val: number): void {
    this.valoare = val;
  }

  setBun(bun: Bun): void {
    this.bun = bun;
  }

  setId(id: number): void {
    this.id_linie_consum = id;
  }

  setIdConsum(id: number): void {
    this.id_consum = id;
  }

  // Utilități
  diferenta(): number {
    return this.cantitate_necesara - this.cant_eliberata;
  }

  toJson(): any {
    return {
      id_linie_consum: this.id_linie_consum,
      id_consum: this.id_consum,
      id_bun: this.id_bun,
      cantitate_necesara: this.cantitate_necesara,
      cant_eliberata: this.cant_eliberata,
      valoare: this.valoare,
      bun: this.bun?.toJson?.() ?? null
    };
  }

  static fromPrisma(data: any): LinieConsum {
    const linie = new LinieConsum(
      data.id_linie_consum ?? null,
      data.id_consum ?? null,
      data.id_bun,
      data.cantitate_necesara,
      data.valoare,
      data.cant_eliberata
    );

    if (data.bun) {
      linie.setBun(Bun.fromPrisma(data.bun)); // asigură-te că ai Bun.fromPrisma
    }

    return linie;
  }

  static fromApi(data: any): LinieConsum {
    const linie = new LinieConsum(
      data.id_linie_consum ?? null,
      data.id_consum ?? null,
      data.id_bun,
      data.cantitate_necesara,
      data.valoare,
      data.cant_eliberata
    );

    if (data.bun) {
      linie.setBun(Bun.fromPrisma(data.bun)); // presupunem că vine cu structură completă
    }

    return linie;
  }
}
