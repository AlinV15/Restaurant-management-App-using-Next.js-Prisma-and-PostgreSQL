export class Gestiune {
  constructor(
    public id_gestiune: number,
    public denumire: string | null,
    public id_gestionar: number | null
  ) { }

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
}
