// lib/classes/LinieCerereAprovizionare.ts

import { Bun } from "./Bun";

export class LinieCerereAprovizionare {
  private bun?: Bun;

  constructor(
    private id: number,
    private id_cerere: number,
    private id_bun: number,
    private cantitate: number,
    private valoare: number,
    private observatii?: string
  ) { }

  // Getteri
  public getId(): number {
    return this.id;
  }

  public getIdCerere(): number {
    return this.id_cerere;
  }

  public getIdBun(): number {
    return this.id_bun;
  }

  public getCantitate(): number {
    return this.cantitate;
  }

  public getValoare(): number {
    return this.valoare;
  }

  public getBun(): Bun | undefined {
    return this.bun;
  }

  public getObservatii(): string | undefined {
    return this.observatii;
  }

  // Setteri
  public setCantitate(qty: number): void {
    this.cantitate = qty;
  }

  public setValoare(val: number): void {
    this.valoare = val;
  }

  public setBun(b: Bun): void {
    this.bun = b;
  }

  public setObservatii(obs: string): void {
    this.observatii = obs;
  }

  // Conversii
  public static fromPrisma(data: any): LinieCerereAprovizionare {
    const ln = new LinieCerereAprovizionare(
      data.id,
      data.id_cerere,
      data.id_bun,
      Number(data.cantitate),
      Number(data.valoare),
      data.observatii ?? undefined
    );

    if (data.bun) {
      ln.setBun(Bun.fromPrisma(data.bun));
    }

    return ln;
  }

  public static fromApi(data: any): LinieCerereAprovizionare {
    const ln = new LinieCerereAprovizionare(
      data.id,
      data.id_cerere,
      data.id_bun,
      Number(data.cantitate),
      Number(data.valoare),
      data.observatii ?? undefined
    );

    if (data.bun) {
      ln.setBun(Bun.fromApi(data.bun));
    }

    return ln;
  }

  public toJson(): any {
    return {
      id: this.id,
      id_cerere: this.id_cerere,
      id_bun: this.id_bun,
      cantitate: this.cantitate,
      valoare: this.valoare,
      observatii: this.observatii ?? null,
      bun: this.bun?.toJson?.() ?? null
    };
  }
}
