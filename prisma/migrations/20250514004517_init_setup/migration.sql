-- CreateEnum
CREATE TYPE "StatusLinieReceptie" AS ENUM ('receptionata', 'partiala', 'respinsa');

-- CreateEnum
CREATE TYPE "StatusLivrare" AS ENUM ('În așteptare', 'În curs de livrare', 'Livrată', 'Anulată', 'Neconfirmată');

-- CreateEnum
CREATE TYPE "StatusCerere" AS ENUM ('în așteptare', 'aprobată', 'respinsă', 'finalizată');

-- CreateTable
CREATE TABLE "Document" (
    "nr_document" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("nr_document")
);

-- CreateTable
CREATE TABLE "Angajati" (
    "id_angajat" SERIAL NOT NULL,
    "nume_angajat" TEXT NOT NULL,
    "prenume_angajat" TEXT NOT NULL,
    "functie" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "data_angajare" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Angajati_pkey" PRIMARY KEY ("id_angajat")
);

-- CreateTable
CREATE TABLE "Consum" (
    "nr_document" INTEGER NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_sef" INTEGER,
    "id_gestiune" INTEGER NOT NULL,

    CONSTRAINT "Consum_pkey" PRIMARY KEY ("nr_document")
);

-- CreateTable
CREATE TABLE "CerereAprovizionare" (
    "nr_document" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_gestiune" INTEGER NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,
    "status" "StatusCerere" NOT NULL DEFAULT 'în așteptare',

    CONSTRAINT "CerereAprovizionare_pkey" PRIMARY KEY ("nr_document")
);

-- CreateTable
CREATE TABLE "Stoc" (
    "id_stoc" SERIAL NOT NULL,
    "id_bun" INTEGER NOT NULL,
    "id_gestiune" INTEGER NOT NULL,
    "stoc_init_lunar" DECIMAL(65,30),
    "stoc_actual" DECIMAL(65,30),
    "prag_minim" DECIMAL(65,30),
    "cantitate_optima" DECIMAL(65,30),

    CONSTRAINT "Stoc_pkey" PRIMARY KEY ("id_stoc")
);

-- CreateTable
CREATE TABLE "Gestiune" (
    "id_gestiune" SERIAL NOT NULL,
    "denumire" TEXT,
    "id_gestionar" INTEGER,

    CONSTRAINT "Gestiune_pkey" PRIMARY KEY ("id_gestiune")
);

-- CreateTable
CREATE TABLE "Bun" (
    "id_bun" SERIAL NOT NULL,
    "nume_bun" TEXT NOT NULL,
    "cantitate_disponibila" DECIMAL(65,30) NOT NULL,
    "pret_unitar" DECIMAL(65,30) NOT NULL,
    "data_expirare" TIMESTAMP(3),
    "unitate_masura" TEXT NOT NULL,

    CONSTRAINT "Bun_pkey" PRIMARY KEY ("id_bun")
);

-- CreateTable
CREATE TABLE "LinieConsum" (
    "id_linie_consum" SERIAL NOT NULL,
    "id_consum" INTEGER NOT NULL,
    "id_bun" INTEGER NOT NULL,
    "cantitate_necesara" DECIMAL(65,30) NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,
    "cant_eliberata" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "LinieConsum_pkey" PRIMARY KEY ("id_linie_consum")
);

-- CreateTable
CREATE TABLE "LinieCerereAprovizionare" (
    "id" SERIAL NOT NULL,
    "id_cerere" INTEGER NOT NULL,
    "id_bun" INTEGER NOT NULL,
    "cantitate" DECIMAL(65,30) NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,
    "observatii" TEXT,

    CONSTRAINT "LinieCerereAprovizionare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receptie" (
    "nr_document" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valoare_totala" DECIMAL(65,30) NOT NULL DEFAULT 0.0,

    CONSTRAINT "Receptie_pkey" PRIMARY KEY ("nr_document")
);

-- CreateTable
CREATE TABLE "Linie_receptie" (
    "id_linie_receptie" SERIAL NOT NULL,
    "id_bun" INTEGER NOT NULL,
    "id_receptie" INTEGER NOT NULL,
    "cantitate_receptionata" DECIMAL(65,30) NOT NULL,
    "pret" DECIMAL(65,30) NOT NULL,
    "status" "StatusLinieReceptie" NOT NULL DEFAULT 'receptionata',
    "validat" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Linie_receptie_pkey" PRIMARY KEY ("id_linie_receptie")
);

-- CreateTable
CREATE TABLE "Comanda" (
    "id_comanda" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,
    "id_client" INTEGER NOT NULL,

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE "Client" (
    "id_client" SERIAL NOT NULL,
    "nume" TEXT NOT NULL,
    "adresa" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "Linie_comanda" (
    "id_linie_comanda" SERIAL NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "id_produs" INTEGER NOT NULL,
    "cantitate" INTEGER NOT NULL,
    "valoare" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Linie_comanda_pkey" PRIMARY KEY ("id_linie_comanda")
);

-- CreateTable
CREATE TABLE "Produs" (
    "id_produs" SERIAL NOT NULL,
    "pret" DECIMAL(65,30) NOT NULL,
    "cantitate" DECIMAL(65,30) NOT NULL,
    "um" TEXT NOT NULL,
    "denumire" TEXT NOT NULL,
    "id_reteta" INTEGER,

    CONSTRAINT "Produs_pkey" PRIMARY KEY ("id_produs")
);

-- CreateTable
CREATE TABLE "Masa" (
    "id_masa" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "nrMasa" INTEGER NOT NULL,

    CONSTRAINT "Masa_pkey" PRIMARY KEY ("id_masa")
);

-- CreateTable
CREATE TABLE "Comenzi_onsite" (
    "id_comanda" INTEGER NOT NULL,
    "id_masa" INTEGER NOT NULL,

    CONSTRAINT "Comenzi_onsite_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE "Comenzi_online" (
    "id_comanda" INTEGER NOT NULL,
    "adresa_livrare" TEXT NOT NULL,

    CONSTRAINT "Comenzi_online_pkey" PRIMARY KEY ("id_comanda")
);

-- CreateTable
CREATE TABLE "Livrare" (
    "id_livrare" SERIAL NOT NULL,
    "id_comanda" INTEGER NOT NULL,
    "adresa_livrare" TEXT NOT NULL,
    "id_angajat" INTEGER NOT NULL,
    "data_livrare" TIMESTAMP(3) NOT NULL,
    "status_livrare" "StatusLivrare" NOT NULL,

    CONSTRAINT "Livrare_pkey" PRIMARY KEY ("id_livrare")
);

-- AddForeignKey
ALTER TABLE "Consum" ADD CONSTRAINT "Consum_nr_document_fkey" FOREIGN KEY ("nr_document") REFERENCES "Document"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consum" ADD CONSTRAINT "Consum_id_sef_fkey" FOREIGN KEY ("id_sef") REFERENCES "Angajati"("id_angajat") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consum" ADD CONSTRAINT "Consum_id_gestiune_fkey" FOREIGN KEY ("id_gestiune") REFERENCES "Gestiune"("id_gestiune") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CerereAprovizionare" ADD CONSTRAINT "CerereAprovizionare_nr_document_fkey" FOREIGN KEY ("nr_document") REFERENCES "Document"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CerereAprovizionare" ADD CONSTRAINT "CerereAprovizionare_id_gestiune_fkey" FOREIGN KEY ("id_gestiune") REFERENCES "Gestiune"("id_gestiune") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stoc" ADD CONSTRAINT "Stoc_id_gestiune_fkey" FOREIGN KEY ("id_gestiune") REFERENCES "Gestiune"("id_gestiune") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stoc" ADD CONSTRAINT "Stoc_id_bun_fkey" FOREIGN KEY ("id_bun") REFERENCES "Bun"("id_bun") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gestiune" ADD CONSTRAINT "Gestiune_id_gestionar_fkey" FOREIGN KEY ("id_gestionar") REFERENCES "Angajati"("id_angajat") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieConsum" ADD CONSTRAINT "LinieConsum_id_consum_fkey" FOREIGN KEY ("id_consum") REFERENCES "Consum"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieConsum" ADD CONSTRAINT "LinieConsum_id_bun_fkey" FOREIGN KEY ("id_bun") REFERENCES "Bun"("id_bun") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieCerereAprovizionare" ADD CONSTRAINT "LinieCerereAprovizionare_id_cerere_fkey" FOREIGN KEY ("id_cerere") REFERENCES "CerereAprovizionare"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinieCerereAprovizionare" ADD CONSTRAINT "LinieCerereAprovizionare_id_bun_fkey" FOREIGN KEY ("id_bun") REFERENCES "Bun"("id_bun") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receptie" ADD CONSTRAINT "Receptie_nr_document_fkey" FOREIGN KEY ("nr_document") REFERENCES "Document"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linie_receptie" ADD CONSTRAINT "Linie_receptie_id_bun_fkey" FOREIGN KEY ("id_bun") REFERENCES "Bun"("id_bun") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linie_receptie" ADD CONSTRAINT "Linie_receptie_id_receptie_fkey" FOREIGN KEY ("id_receptie") REFERENCES "Receptie"("nr_document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linie_comanda" ADD CONSTRAINT "Linie_comanda_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Linie_comanda" ADD CONSTRAINT "Linie_comanda_id_produs_fkey" FOREIGN KEY ("id_produs") REFERENCES "Produs"("id_produs") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comenzi_onsite" ADD CONSTRAINT "Comenzi_onsite_id_masa_fkey" FOREIGN KEY ("id_masa") REFERENCES "Masa"("id_masa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comenzi_onsite" ADD CONSTRAINT "Comenzi_onsite_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comenzi_online" ADD CONSTRAINT "Comenzi_online_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livrare" ADD CONSTRAINT "Livrare_id_comanda_fkey" FOREIGN KEY ("id_comanda") REFERENCES "Comanda"("id_comanda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livrare" ADD CONSTRAINT "Livrare_id_angajat_fkey" FOREIGN KEY ("id_angajat") REFERENCES "Angajati"("id_angajat") ON DELETE RESTRICT ON UPDATE CASCADE;
