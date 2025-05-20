// lib/classes/Angajat.ts

export class Angajat {
  constructor(
    private id_angajat: number,
    private nume_angajat: string,
    private prenume_angajat: string,
    private functie: string,
    private telefon: string,
    private email: string,
    private data_angajare: Date
  ) { }

  // Getteri
  public getId(): number {
    return this.id_angajat;
  }

  public getNume(): string {
    return this.nume_angajat;
  }

  public getPrenume(): string {
    return this.prenume_angajat;
  }

  public getFunctie(): string {
    return this.functie;
  }

  public getTelefon(): string {
    return this.telefon;
  }

  public getEmail(): string {
    return this.email;
  }

  public getDataAngajare(): Date {
    return this.data_angajare;
  }

  public getNumeComplet(): string {
    return `${this.prenume_angajat} ${this.nume_angajat}`;
  }

  // Setteri
  public setNume(nume: string): void {
    this.nume_angajat = nume;
  }

  public setPrenume(prenume: string): void {
    this.prenume_angajat = prenume;
  }

  public setFunctie(functie: string): void {
    this.functie = functie;
  }

  public setTelefon(telefon: string): void {
    this.telefon = telefon;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public setDataAngajare(data: Date): void {
    this.data_angajare = data;
  }

  // Conversii
  public static fromPrisma(data: any): Angajat {
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

  public static fromApi(data: any): Angajat {
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

  public static placeholder(id: number): Angajat {
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

  public toJson(): any {
    return {
      id_angajat: this.getId(),
      nume_angajat: this.getNume(),
      prenume_angajat: this.getPrenume(),
      functie: this.getFunctie(),
      telefon: this.getTelefon(),
      email: this.getEmail(),
      data_angajare: this.getDataAngajare().toISOString()
    };
  }
}
