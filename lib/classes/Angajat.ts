import { convertToISO8601 } from "@/app/utils/format"
import { NextResponse } from "next/server"

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

  //getteri
  public getId() {
    return this.id_angajat
  }

  public getNume() {
    return this.nume_angajat
  }

  public getPrenume() {
    return this.prenume_angajat
  }

  public getFunctie() {
    return this.functie
  }

  public getTelefon() {
    return this.telefon
  }

  public getEmail() {
    return this.email
  }

  public getDataAngajare() {
    return this.data_angajare
  }

  //setteri

  public setNume(nume: string) {
    this.nume_angajat = nume
  }
  public setPrenume(prenume: string) {
    this.prenume_angajat = prenume
  }

  public setFunctie(functie: string) {
    this.functie = functie
  }

  public setTelefon(telefon: string) {
    this.telefon = telefon
  }

  public setEmail(email: string) {
    this.email = email
  }

  public setDataAngajare(data: Date) {
    this.data_angajare = data
  }


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

  toJson() {
    return {
      id_angajat: this.getId(),
      nume_angajat: this.getNume(),
      prenume_angajat: this.getPrenume(),
      functie: this.getFunctie(),
      telefon: this.getTelefon(),
      email: this.getEmail(),
      data_angajare: this.getDataAngajare()
    }
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

  static async postAngajat(data: any, prisma: any) {
    const { nume_angajat, prenume_angajat, email, telefon, functie, data_angajare } = data;

    console.log("Datele primite:", data);


    if (!nume_angajat || !prenume_angajat || !functie || !telefon || !email || !data_angajare) {
      return NextResponse.json({ error: "Toate campurile sunt obligatorii" }, { status: 400 });
    }

    const dataCorecta = convertToISO8601(data_angajare)

    const angajatNou = await prisma.angajati.create({
      data: {
        nume_angajat,
        prenume_angajat,
        functie,
        telefon,
        email,
        data_angajare: dataCorecta
      }
    });

    console.log("Angajatul a fost adaugat cu succes!");
    return angajatNou
  }


  static async updateAngajat(data: any, idNumeric: number, prisma: any) {
    const { nume_angajat, prenume_angajat, email, telefon, functie, data_angajare } = data;

    if (!nume_angajat || !prenume_angajat || !email || !telefon || !functie || !data_angajare) {
      return NextResponse.json({ error: 'Toate câmpurile sunt obligatorii' }, { status: 400 });
    }

    const existingAngajat = await prisma.angajati.findUnique({
      where: { id_angajat: idNumeric },
    });

    if (!existingAngajat) {
      return NextResponse.json({ error: 'Angajatul nu a fost găsit' }, { status: 404 });
    }
    return await prisma.angajati.update({
      where: { id_angajat: idNumeric },
      data: {
        nume_angajat,
        prenume_angajat,
        email,
        telefon,
        functie,
        data_angajare
      }
    });
  }

}
