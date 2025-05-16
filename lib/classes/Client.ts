export class Client {
  constructor(
    public id_client: number,
    public nume: string,
    public adresa: string,
    public telefon: string
  ) {}

  static fromPrisma(data: any): Client {
    return new Client(
      data.id_client,
      data.nume,
      data.adresa,
      data.telefon
    );
  }

  contactInfo(): string {
    return `${this.nume} | ${this.telefon}`;
  }
}
