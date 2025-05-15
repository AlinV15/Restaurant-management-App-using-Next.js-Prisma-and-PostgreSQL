export class Angajat {
  constructor(
    public id_angajat: number,
    public nume_angajat: string,
    public prenume_angajat: string,
    public functie: string,
    public telefon: string,
    public email: string,
    public data_angajare: Date
  ) { }

  getNumeComplet(): string {
    return `${this.prenume_angajat} ${this.nume_angajat}`;
  }

  static fromPrisma(data: any): Angajat {
    return new Angajat(
      data.id_angajat,
      data.nume_angajat,
      data.prenume_angajat,
      data.functie,
      data.telefon,
      data.email,
      new Date(data.data_angajare)
    );
  }

  static placeholder(id: number): Angajat {
    return new Angajat(
      id,
      "Necunoscut",
      "Necunoscut",
      "Necunoscut",
      "",
      "",
      new Date()
    );
  }

}
