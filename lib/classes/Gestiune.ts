import { Consum } from "./Consum"

export class Gestiune {
  private consumuri!: Consum[]
  private totalGestiune!: number
  constructor(
    private id_gestiune: number,
    private denumire: string | null,
    private id_gestionar: number | null
  ) { }

  //getteri
  public getDenumire() {
    return this.denumire
  }

  public getId_gestionar() {
    return this.id_gestionar
  }

  public getID() {
    return this.id_gestiune
  }

  //setteri
  public setDenumire(den: string) {
    this.denumire = den
  }

  public setIdGestionar(gestionar: number) {
    this.id_gestionar = gestionar
  }

  //alte metode

  static fromPrisma(data: any): Gestiune {
    return new Gestiune(
      data.id_gestiune,
      data.denumire ?? null,
      data.id_gestionar ?? null
    );
  }



  static placeholder(id: number): Gestiune {
    return new Gestiune(id, "Necunoscută", 0);
  }
  esteAsignata(): boolean {
    return this.id_gestionar !== null;
  }

  toJson(): any {
    return {
      id_gestiune: this.id_gestiune,
      denumire: this.denumire,
      id_gestionar: this.id_gestionar
    };
  }

  static fromApi(data: any): Gestiune {
    return new Gestiune(
      data.id_gestiune,
      data.denumire ?? null,
      data.id_gestionar ?? null
    );
  }

  adaugaConsum(consum: Consum): void {
    this.consumuri.push(consum);
    this.totalGestiune += consum.getTotal();
  }

  getConsumuri(): Consum[] {
    return this.consumuri;
  }

  getTotal(): number {
    return this.totalGestiune;
  }

  getTotaluriBunuri(): Record<number, number> {
    const totaluri: Record<number, number> = {};

    for (const consum of this.consumuri) {
      for (const linie of consum.linii) {
        const idBun = linie.getIdBun();
        if (!totaluri[idBun]) {
          totaluri[idBun] = 0;
        }
        totaluri[idBun] += linie.getValoare();
      }
    }

    return totaluri;
  }

  /**
   * Calculează cantitatea totală pentru fiecare bun consumat în gestiune
   *  Un obiect care mapează ID-ul bunului la cantitatea totală consumată
   */
  getCantitatiTotaleBunuri(): Record<number, number> {
    const cantitati: Record<number, number> = {};

    for (const consum of this.consumuri) {
      for (const linie of consum.linii) {
        const idBun = linie.getIdBun();
        if (!cantitati[idBun]) {
          cantitati[idBun] = 0;
        }
        cantitati[idBun] += linie.getCantitateEliberata();
      }
    }

    return cantitati;
  }
}
