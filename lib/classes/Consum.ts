// lib/classes/Consum.ts

import { LinieConsum } from "./LinieConsum";
import { Angajat } from "./Angajat";
import { Gestiune } from "./Gestiune";

export abstract class Document {
  constructor(
    private nr_document: number,
    private data: Date
  ) { }

  public getId() {
    return this.nr_document;
  }

  public getData() {
    return this.data;
  }

  public setData(data: Date) {
    this.data = data;
  }

  abstract tipDocument(): string;
}

export class Consum extends Document {
  private sef!: Angajat;
  private gestiune!: Gestiune;

  constructor(
    nr_document: number,
    data: Date,
    private valoare: number,
    private id_sef: number | null,
    private id_gestiune: number,
    public linii: LinieConsum[] = []
  ) {
    super(nr_document, data);
  }

  // Getteri
  public getValoare() {
    return this.valoare;
  }

  public getIdSef() {
    return this.id_sef;
  }

  public getIdGestiune() {
    return this.id_gestiune;
  }

  getSef() {
    return this.sef;
  }

  getGestiune() {
    return this.gestiune;
  }

  // Setteri
  public setValoare(val: number) {
    this.valoare = val;
  }

  public setIdSef(sef: number) {
    this.id_sef = sef;
  }

  public setIdGestiune(gestiune: number) {
    this.id_gestiune = gestiune;
  }

  setSef(sef: Angajat) {
    this.sef = sef;
  }

  setGestiune(gestiune: Gestiune) {
    this.gestiune = gestiune;
  }

  // Metode de business
  tipDocument(): string {
    return "Consum";
  }

  totalCantitati(): number {
    return this.linii.reduce((acc, linie) => acc + Number(linie.getCantitateEliberata()), 0);
  }

  getTotal(): number {
    return this.valoare;
  }

  // Conversii
  toJson(): any {
    return {
      nr_document: this.getId(),
      valoare: this.valoare,
      data: this.getData().toISOString(),
      id_sef: this.id_sef,
      id_gestiune: this.id_gestiune,
      linii: this.linii.map(l => l.toJson()),
      gestiune: this.gestiune?.toJson?.(),
      sef: this.sef?.toJson?.(),
    };
  }

  static fromApi(data: any): Consum {
    return new Consum(
      data.nr_document,
      new Date(data.data),
      Number(data.valoare),
      data.id_sef ?? null,
      data.id_gestiune,
      data.linii ? data.linii.map((l: any) => LinieConsum.fromApi(l)) : []
    );
  }

  static fromPrisma(data: any): Consum {
    const cns = new Consum(
      data.nr_document,
      new Date(data.data),
      Number(data.valoare),
      data.id_sef ?? null,
      data.id_gestiune,
      data.liniiConsum ? data.liniiConsum.map((lc: any) => LinieConsum.fromPrisma(lc)) : []
    );

    if (data.gestiune) {
      cns.setGestiune(Gestiune.fromPrisma(data.gestiune));
    }

    if (data.sef) {
      cns.setSef(Angajat.fromPrisma(data.sef));
    }

    return cns;
  }

  static placeholder(id: number): Consum {
    return new Consum(id, new Date(), 0, 0, 0);
  }
}
