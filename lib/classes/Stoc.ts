import { NextResponse } from "next/server";
import { Bun } from "./Bun"
import { Gestiune } from "./Gestiune";

export class Stoc {
  private bun!: Bun;
  private gestiune!: Gestiune
  constructor(
    private id_stoc: number,
    private id_bun: number,
    private id_gestiune: number,
    private stoc_init_lunar?: number,
    private stoc_actual?: number,
    private prag_minim?: number,
    private cantitate_optima?: number
  ) { }

  // getteri
  getId() {
    return this.id_stoc
  }

  getIdBun() {
    return this.id_bun
  }

  getIdGestiune() {
    return this.id_gestiune
  }

  getStocInitLunar() {
    return this.stoc_init_lunar
  }

  getStocActual() {
    return this.stoc_actual
  }

  getPragMinim() {
    return this.prag_minim
  }

  getCantitateOptima() {
    return this.cantitate_optima
  }

  getBun() {
    return this.bun
  }

  getGestiune() {
    return this.gestiune
  }

  //setteri

  setStocInitLunar(stocInit: number) {
    this.stoc_init_lunar = stocInit
  }

  setStocActual(stocActual: number) {
    this.stoc_actual = stocActual
  }

  setPragMinim(pragMinim: number) {
    this.prag_minim = pragMinim
  }

  setCantitateOptima(cantitate: number) {
    this.cantitate_optima = cantitate
  }

  setBun(bun: Bun) {
    this.bun = bun
  }

  setGestiune(gestiune: Gestiune) {
    this.gestiune = gestiune
  }

  //alte metode
  esteSubPrag(): boolean {
    if (this.stoc_actual === undefined || this.prag_minim === undefined) return false;
    return this.stoc_actual < this.prag_minim;
  }

  static fromPrisma(data: any): Stoc {
    const stk = new Stoc(
      data.id_stoc,
      data.id_bun,
      data.id_gestiune,
      data.stoc_init_lunar ? Number(data.stoc_init_lunar) : undefined,
      data.stoc_actual ? Number(data.stoc_actual) : undefined,
      data.prag_minim ? Number(data.prag_minim) : undefined,
      data.cantitate_optima ? Number(data.cantitate_optima) : undefined
    );

    stk.bun = data.bun ?? null;
    stk.gestiune = data.gestiune ?? null;
    return stk;
  }

  static async createInDB(prisma: any, body: any) {
    const { id_bun, id_gestiune, stoc_init_lunar, prag_minim, cantitate_optima } = body;

    const actualStoc = await prisma.bun.findUnique({
      where: { id_bun }
    })

    if (!actualStoc) {
      return NextResponse.json({ error: "Bun not found" }, { status: 404 });
    }

    const allSameStocks = await prisma.stoc.findMany({
      where: {
        id_bun,
        id_gestiune
      }
    })

    if (allSameStocks.length > 0) {
      return NextResponse.json({ error: "Stoc already exists for this bun and gestiune" }, { status: 400 });

    }


    const data = await prisma.stoc.create({
      data: {
        id_bun,
        id_gestiune,
        stoc_init_lunar,
        stoc_actual: actualStoc.cantitate_disponibila,
        prag_minim,
        cantitate_optima
      }
    });

    return Stoc.fromPrisma(data)
  }


  static async updateInDB(prisma: any, idNumeric: number, body: any) {
    const { id_bun, id_gestiune, stoc_init_lunar, prag_minim, cantitate_optima } = body;

    if (!id_bun || !id_gestiune || !stoc_init_lunar || !prag_minim || !cantitate_optima) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data = await prisma.stoc.update({
      where: { id_stoc: idNumeric },
      data: {
        stoc_init_lunar,
        prag_minim,
        cantitate_optima
      }
    });

    return Stoc.fromPrisma(data);
  }

}
