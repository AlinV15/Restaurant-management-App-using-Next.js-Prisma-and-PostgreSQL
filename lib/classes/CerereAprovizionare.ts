// lib/classes/CerereAprovizionare.ts

import { Document } from "./Consum";
import { LinieCerereAprovizionare } from "./LinieCerereAprovizionare";

export enum StatusCerere {
  IN_ASTEPTARE = "în așteptare",
  APROBATA = "aprobată",
  RESPINSA = "respinsă",
  FINALIZATA = "finalizată"
}

export class CerereAprovizionare extends Document {
  constructor(
    nr_document: number,
    data: Date,
    private id_gestiune: number,
    private valoare: number,
    private status: StatusCerere = StatusCerere.IN_ASTEPTARE,
    public linii: LinieCerereAprovizionare[] = []
  ) {
    super(nr_document, data);
  }

  // Getteri
  public getIdGestiune(): number {
    return this.id_gestiune;
  }

  public getValoare(): number {
    return this.valoare;
  }

  public getStatus(): StatusCerere {
    return this.status;
  }

  // Setteri
  public setStatus(status: StatusCerere): void {
    this.status = status;
  }

  public setValoare(val: number): void {
    this.valoare = val;
  }

  public tipDocument(): string {
    return "CerereAprovizionare";
  }

  // Metode de business
  public aproba(): void {
    this.status = StatusCerere.APROBATA;
  }

  public respinge(): void {
    this.status = StatusCerere.RESPINSA;
  }

  public finalizeaza(): void {
    this.status = StatusCerere.FINALIZATA;
  }

  // Conversii
  public static fromPrisma(data: any): CerereAprovizionare {
    return new CerereAprovizionare(
      data.id_cerere ?? data.nr_document,
      new Date(data.data),
      data.id_gestiune,
      Number(data.valoare),
      data.status,
      data.liniiCerere ? data.liniiCerere.map((lc: any) => LinieCerereAprovizionare.fromPrisma(lc)) : []
    );
  }

  public static fromApi(data: any): CerereAprovizionare {
    return new CerereAprovizionare(
      data.id_cerere ?? data.nr_document,
      new Date(data.data),
      data.id_gestiune,
      Number(data.valoare),
      data.status,
      data.linii ? data.linii.map((l: any) => LinieCerereAprovizionare.fromApi(l)) : []
    );
  }

  public toJson(): any {
    return {
      nr_document: this.getId(),
      data: this.getData().toISOString(),
      id_gestiune: this.id_gestiune,
      valoare: this.valoare,
      status: this.status,
      linii: this.linii.map(l => l.toJson())
    };
  }

  public static placeholder(id: number): CerereAprovizionare {
    return new CerereAprovizionare(id, new Date(), 0, 0);
  }
}