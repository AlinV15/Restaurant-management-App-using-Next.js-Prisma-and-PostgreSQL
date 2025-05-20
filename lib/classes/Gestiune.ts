// lib/classes/Gestiune.ts

import { Angajat } from "./Angajat";
import { Consum } from "./Consum";

export class Gestiune {
  private consumuri: Consum[] = [];
  private totalGestiune: number = 0;
  private angajat!: Angajat;

  constructor(
    private id_gestiune: number,
    private denumire: string | null,
    private id_gestionar: number | null
  ) { }

  // Getteri
  public getDenumire(): string | null {
    return this.denumire;
  }

  public getIdGestionar(): number | null {
    return this.id_gestionar;
  }

  public getIdGestiune(): number {
    return this.id_gestiune;
  }

  public getAngajat(): Angajat {
    return this.angajat;
  }

  public getConsumuri(): Consum[] {
    return this.consumuri;
  }

  public getTotal(): number {
    return this.totalGestiune;
  }

  // Setteri
  public setDenumire(den: string): void {
    this.denumire = den;
  }

  public setIdGestionar(gestionar: number): void {
    this.id_gestionar = gestionar;
  }

  public setAngajat(ang: Angajat): void {
    this.angajat = ang;
  }

  // Metode de business
  public esteAsignata(): boolean {
    return this.id_gestionar !== null;
  }

  public adaugaConsum(consum: Consum): void {
    this.consumuri.push(consum);
    this.totalGestiune += consum.getTotal();
  }

  public getTotaluriBunuri(): Record<number, number> {
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

  public getCantitatiTotaleBunuri(): Record<number, number> {
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

  // Conversii
  public toJson(): any {
    return {
      id_gestiune: this.id_gestiune,
      denumire: this.denumire,
      id_gestionar: this.id_gestionar
    };
  }

  public static fromPrisma(data: any): Gestiune {
    return new Gestiune(
      data.id_gestiune,
      data.denumire ?? null,
      data.id_gestionar ?? null
    );
  }

  public static fromApi(data: any): Gestiune {
    return new Gestiune(
      data.id_gestiune,
      data.denumire ?? null,
      data.id_gestionar ?? null
    );
  }

  public static placeholder(id: number): Gestiune {
    return new Gestiune(id, "Necunoscută", 0);
  }
}