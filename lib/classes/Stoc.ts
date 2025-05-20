// lib/classes/Stoc.ts

import { Bun } from "./Bun";
import { Gestiune } from "./Gestiune";

export class Stoc {
  private bun?: Bun;
  private gestiune?: Gestiune;

  constructor(
    private id_stoc: number,
    private id_bun: number,
    private id_gestiune: number,
    private stoc_init_lunar?: number,
    private stoc_actual?: number,
    private prag_minim?: number,
    private cantitate_optima?: number
  ) { }

  // Getteri
  getId(): number {
    return this.id_stoc;
  }

  getIdBun(): number {
    return this.id_bun;
  }

  getIdGestiune(): number {
    return this.id_gestiune;
  }

  getStocInitLunar(): number | undefined {
    return this.stoc_init_lunar;
  }

  getStocActual(): number | undefined {
    return this.stoc_actual;
  }

  getPragMinim(): number | undefined {
    return this.prag_minim;
  }

  getCantitateOptima(): number | undefined {
    return this.cantitate_optima;
  }

  getBun(): Bun | undefined {
    return this.bun;
  }

  getGestiune(): Gestiune | undefined {
    return this.gestiune;
  }

  // Setteri
  setStocInitLunar(stocInit: number): void {
    this.stoc_init_lunar = stocInit;
  }

  setStocActual(stocActual: number): void {
    this.stoc_actual = stocActual;
  }

  setPragMinim(pragMinim: number): void {
    this.prag_minim = pragMinim;
  }

  setCantitateOptima(cantitate: number): void {
    this.cantitate_optima = cantitate;
  }

  setBun(bun: Bun): void {
    this.bun = bun;
  }

  setGestiune(gestiune: Gestiune): void {
    this.gestiune = gestiune;
  }

  // Business logic
  esteSubPrag(): boolean {
    if (this.stoc_actual === undefined || this.prag_minim === undefined) return false;
    return this.stoc_actual < this.prag_minim;
  }

  // Conversii
  static fromPrisma(data: any): Stoc {
    const stoc = new Stoc(
      data.id_stoc,
      data.id_bun,
      data.id_gestiune,
      data.stoc_init_lunar ? Number(data.stoc_init_lunar) : undefined,
      data.stoc_actual ? Number(data.stoc_actual) : undefined,
      data.prag_minim ? Number(data.prag_minim) : undefined,
      data.cantitate_optima ? Number(data.cantitate_optima) : undefined
    );

    if (data.bun) stoc.setBun(Bun.fromPrisma(data.bun));
    if (data.gestiune) stoc.setGestiune(Gestiune.fromPrisma(data.gestiune));

    return stoc;
  }

  toJson(): any {
    return {
      id_stoc: this.id_stoc,
      id_bun: this.id_bun,
      id_gestiune: this.id_gestiune,
      stoc_init_lunar: this.stoc_init_lunar,
      stoc_actual: this.stoc_actual,
      prag_minim: this.prag_minim,
      cantitate_optima: this.cantitate_optima,
      bun: this.bun?.toJson?.() ?? null,
      gestiune: this.gestiune?.toJson?.() ?? null
    };
  }
}