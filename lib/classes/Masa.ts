export class Masa {
  constructor(
    public id_masa: number,
    public status: string,
    public nrMasa: number
  ) {}

  static fromPrisma(data: any): Masa {
    return new Masa(
      data.id_masa,
      data.status,
      data.nrMasa
    );
  }

  esteLibera(): boolean {
    return this.status.toLowerCase() === "libera";
  }
}
