'use client'

// rapoarte/consum/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as _ from 'lodash';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import * as Papa from 'papaparse';
import { BsFiletypeCsv, BsFiletypePdf } from 'react-icons/bs';
import { GrDocumentWord } from 'react-icons/gr';
import { IoMdReturnLeft } from 'react-icons/io';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';


// Base interfaces
interface Bun {
  id_bun: number;
  nume_bun: string;
  cantitate_disponibila: number;
  pret_unitar: number;
  data_expirare?: Date;
  unitate_masura: string;
}

interface LinieConsum {
  id_linie_consum: number;
  id_consum: number;
  id_bun: number;
  cantitate_necesara: number;
  valoare: number;
  cant_eliberata: number;
  bun?: Bun;
  // Pentru afișare
  cod?: number;
  denumire?: string;
  um?: string;
  pret_unitar?: number;
  cantitate?: number;
}

interface Angajat {
  id_angajat: number;
  nume_angajat: string;
  prenume_angajat: string;
  functie: string;
  telefon: string;
  email: string;
  data_angajare: Date;
}

interface Gestiune {
  id_gestiune: number;
  denumire: string;
  id_gestionar: number;
}

interface Consum {
  id_consum: number;
  valoare: number;
  data: Date;
  id_sef: number;
  id_gestiune: number;
  sef?: Angajat;
  gestiune?: Gestiune;
  liniiConsum: LinieConsum[];
}

// Report interfaces
interface ConsumRaport {
  id_consum: number;
  data: Date;
  valoare: number;
  liniiConsum: LinieConsum[];
}

interface GestiuneRaport {
  id: number;
  nume: string;
  consumuri: ConsumRaport[];
  total: number;
}

interface RaportConsum {
  title: string;
  perioada: string;
  gestiuni: GestiuneRaport[];
  totalGeneral: number;
}

// Function to create a Word document using docx library
const createDocxDocument = (report: RaportConsum): Promise<Blob> => {
  // Build all document elements first
  const documentChildren = [];

  // Title and period
  const title = new Paragraph({
    text: report.title,
    heading: HeadingLevel.HEADING_1,
  });

  const period = new Paragraph({
    children: [
      new TextRun({
        text: `în perioada ${report.perioada}`,
        size: 24,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  });

  // Add elements to document children
  documentChildren.push(title, period);

  // For each gestiune
  report.gestiuni.forEach((gestiune) => {
    // Gestiune header
    documentChildren.push(
      new Paragraph({
        text: gestiune.nume,
        heading: HeadingLevel.HEADING_2,
      })
    );

    // Process each consumption document
    gestiune.consumuri.forEach((consum) => {
      // Add consumption header
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Bon de consum nr. ${consum.id_consum} din data: ${new Date(
                consum.data
              ).toLocaleDateString("ro-RO")}`,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 200, after: 200 },
        })
      );

      // Create table for this consumption
      const rows = [
        // Header row
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: "Cod", alignment: AlignmentType.CENTER }),
              ],
              shading: { fill: "DDDDDD" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: "Denumire",
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "DDDDDD" },
            }),
            new TableCell({
              children: [
                new Paragraph({ text: "UM", alignment: AlignmentType.CENTER }),
              ],
              shading: { fill: "DDDDDD" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: "Preț unitar",
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "DDDDDD" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: "Cantitate",
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "DDDDDD" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: "Valoare",
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "DDDDDD" },
            }),
          ],
        }),
      ];

      // Add rows for each line item
      consum.liniiConsum.forEach((linie) => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(linie.id_bun.toString())],
              }),
              new TableCell({
                children: [new Paragraph(linie.bun?.nume_bun || "")],
              }),
              new TableCell({
                children: [new Paragraph(linie.bun?.unitate_masura || "")],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: (linie.bun?.pret_unitar || 0).toFixed(2),
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: linie.cantitate_necesara.toString(),
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: linie.valoare.toFixed(2),
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
              }),
            ],
          })
        );
      });

      // Add total row for this consumption
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("")],
              columnSpan: 5,
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: `Total: ${consum.valoare.toFixed(2)} lei`,
                  alignment: AlignmentType.RIGHT,
                }),
              ],
              shading: { fill: "F2F2F2" },
            }),
          ],
        })
      );

      // Create table and add to document
      const table = new Table({
        rows: rows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        },
      });

      documentChildren.push(table);

      // Add space after each table
      documentChildren.push(
        new Paragraph({ text: "", spacing: { after: 200 } })
      );
    });

    // Add gestiune total
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Total gestiune ${gestiune.nume}: ${gestiune.total.toFixed(2)} lei`,
            bold: true,
            size: 24,
          }),
        ],
        style: "totalStyle",
        spacing: { before: 200, after: 400 },
      })
    );
  });

  // Add general total
  documentChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `TOTAL GENERAL: ${report.totalGeneral.toFixed(2)} lei`,
          bold: true,
          size: 28,
        }),
      ],
      style: "totalStyle",
      spacing: { before: 400 },
    })
  );

  // Create document with all content properly structured
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 28,
            bold: true,
            color: "000000",
          },
          paragraph: {
            spacing: {
              after: 120,
            },
            alignment: AlignmentType.CENTER,
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 26,
            bold: true,
            color: "000000",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: "totalStyle",
          name: "Total Style",
          basedOn: "Normal",
          next: "Normal",
          run: {
            bold: true,
          },
          paragraph: {
            alignment: AlignmentType.RIGHT,
          },
        },
      ],
    },
    sections: [
      {
        children: documentChildren,
        properties: {}
      }
    ]
  });

  // Generate and return blob
  return Packer.toBlob(doc);
};

const ConsumptionReport: React.FC = () => {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<RaportConsum | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Function to format date
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Function to fetch report data from API
  const fetchReportData = async (params: URLSearchParams): Promise<void> => {
    setIsLoading(true);
    setError("");

    try {
      // Call the API
      const response = await fetch(`/api/rapoarte/consum?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Eroare la generarea raportului: ${response.status}`);
      }

      const data = await response.json();

      // Check if the report has data
      if (!data.gestiuni || data.gestiuni.length === 0) {
        setError("Nu există date pentru criteriile selectate.");
        setReportData(null);
      } else {
        setReportData(data);
      }
    } catch (error) {
      console.error("Eroare la încărcarea datelor raportului:", error);
      setError("Nu s-a putut genera raportul. Vă rugăm încercați din nou.");
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get parameters from URL
    const params = new URLSearchParams();

    // Build parameters for API
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    // Call the function to get data
    fetchReportData(params);
  }, [searchParams]);

  const generatePDF = (): void => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(16);
    doc.text(reportData.title, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`în perioada ${reportData.perioada}`, pageWidth / 2, 30, { align: 'center' });

    let yPosition = 40;
    let pageNumber = 1;

    // Column positions
    const colPositions = {
      cod: 20,
      denumire: 40,
      um: 100,
      pretUnitar: 120,
      cantitate: 150,
      valoare: 180
    };

    // For each gestiune
    reportData.gestiuni.forEach((gestiune) => {
      // Check if we have enough space on the page, otherwise add a new page
      if (yPosition > 250) {
        doc.addPage();
        pageNumber++;
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(gestiune.nume, 20, yPosition);
      yPosition += 10;

      // Process each consum
      gestiune.consumuri.forEach((consum, consumIndex) => {
        // Add bon header
        doc.setFontSize(11);
        doc.text(`Bon nr. ${consum.id_consum} din ${new Date(consum.data).toLocaleDateString('ro-RO')}`, 20, yPosition);
        yPosition += 7;

        // Table header
        addTableHeader(doc, colPositions, yPosition);
        yPosition += 7;

        // Table data for each line of consumption
        consum.liniiConsum.forEach(linie => {
          const item = {
            cod: linie.id_bun,
            denumire: linie.bun?.nume_bun || "",
            um: linie.bun?.unitate_masura || "",
            pret_unitar: linie.bun?.pret_unitar || 0,
            cantitate: linie.cantitate_necesara,
            valoare: linie.valoare
          };

          addTableRow(doc, item, colPositions, yPosition);
          yPosition += 7;

          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            pageNumber++;
            yPosition = 20;
            addTableHeader(doc, colPositions, yPosition);
            yPosition += 7;
          }
        });

        // Bon total
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
        doc.text(`Total bon: ${consum.valoare.toFixed(2)} lei`, 140, yPosition);
        yPosition += 10;

        // Add some space between bons
        yPosition += 5;

        // Check if we need a new page for the next bon
        if (yPosition > 250 && consumIndex < gestiune.consumuri.length - 1) {
          doc.addPage();
          pageNumber++;
          yPosition = 20;
        }
      });

      // Total gestiune
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      doc.text(`Total gestiune: ${gestiune.total.toFixed(2)} lei`, 140, yPosition);
      yPosition += 15;

      // Check if we need a new page for the next gestiune
      if (yPosition > 250) {
        doc.addPage();
        pageNumber++;
        yPosition = 20;
      }
    });

    // Total general
    doc.setFontSize(12);
    doc.text(`Total general: ${reportData.totalGeneral.toFixed(2)} lei`, 140, yPosition);

    // Footer with page number
    for (let i = 1; i <= pageNumber; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Pagina ${i} din ${pageNumber}`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save('raport_consum.pdf');
  };

  // Helper function for adding table headers
  const addTableHeader = (doc: jsPDF, colPositions: any, yPosition: number): void => {
    doc.setFontSize(10);
    doc.text("Cod", colPositions.cod, yPosition);
    doc.text("Denumire", colPositions.denumire, yPosition);
    doc.text("UM", colPositions.um, yPosition);
    doc.text("Preț unitar", colPositions.pretUnitar, yPosition);
    doc.text("Cantitate", colPositions.cantitate, yPosition);
    doc.text("Valoare", colPositions.valoare, yPosition);

    // Line under header
    doc.line(20, yPosition + 2, 190, yPosition + 2);
  };

  // Helper function for adding table rows
  const addTableRow = (doc: jsPDF, item: any, colPositions: any, yPosition: number): void => {
    doc.setFontSize(10);
    doc.text(item.cod.toString(), colPositions.cod, yPosition);

    // Handle long text with truncation or wrapping
    const maxWidth = colPositions.um - colPositions.denumire - 5;
    const textLines = doc.splitTextToSize(item.denumire, maxWidth);
    doc.text(textLines, colPositions.denumire, yPosition);

    doc.text(item.um, colPositions.um, yPosition);
    doc.text(item.pret_unitar.toFixed(2), colPositions.pretUnitar, yPosition);
    doc.text(item.cantitate.toString(), colPositions.cantitate, yPosition);
    doc.text(item.valoare.toFixed(2), colPositions.valoare, yPosition);
  };

  const generateDOCX = async (): Promise<void> => {
    if (!reportData) return;

    try {
      const blob = await createDocxDocument(reportData);
      saveAs(blob, "raport_consum.docx");
    } catch (error) {
      console.error("Eroare la generarea documentului DOCX:", error);
      setError("Nu s-a putut genera documentul DOCX. Vă rugăm încercați din nou.");
    }
  };

  const generateCSV = (): void => {
    if (!reportData) return;

    const csvData: any[][] = [];

    // Header
    csvData.push(["Gestiune", "Nr. Bon", "Data Bon", "Cod", "Denumire", "UM", "Preț unitar", "Cantitate", "Valoare"]);

    // Data
    reportData.gestiuni.forEach(gestiune => {
      gestiune.consumuri.forEach(consum => {
        consum.liniiConsum.forEach(linie => {
          csvData.push([
            gestiune.nume,
            consum.id_consum,
            new Date(consum.data).toLocaleDateString('ro-RO'),
            linie.id_bun,
            linie.bun?.nume_bun || "",
            linie.bun?.unitate_masura || "",
            linie.bun?.pret_unitar?.toFixed(2) || "0.00",
            linie.cantitate_necesara,
            linie.valoare.toFixed(2)
          ]);
        });

        // Add bon total
        csvData.push(["", `Total bon ${consum.id_consum}`, "", "", "", "", "", "", consum.valoare.toFixed(2)]);
        // Add empty row
        csvData.push([]);
      });

      // Add gestiune total
      csvData.push(["Total gestiune " + gestiune.nume, "", "", "", "", "", "", "", gestiune.total.toFixed(2)]);
      // Add empty row between gestiuni
      csvData.push([]);
    });

    // Total general
    csvData.push(["Total general", "", "", "", "", "", "", "", reportData.totalGeneral.toFixed(2)]);

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "raport_consum.csv");
  };

  // Component for rendering report data
  const RenderReport = ({ data }: { data: RaportConsum }) => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{data.title}</h2>
          <p className="text-gray-600">în perioada {data.perioada}</p>
        </div>

        {data.gestiuni.map((gestiune) => (
          <div key={gestiune.id} className="mt-8 border rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">{gestiune.nume}</h3>

            {gestiune.consumuri.map((consum, consumIndex) => (
              <div key={consumIndex} className="mb-6">
                <div className="flex gap-4 mb-2">
                  <p className="text-sm font-medium">
                    Bon nr. {consum.id_consum} din data {new Date(consum.data).toLocaleDateString("ro-RO")}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 border text-left">Cod</th>
                        <th className="py-2 px-3 border text-left">Denumire</th>
                        <th className="py-2 px-3 border text-left">UM</th>
                        <th className="py-2 px-3 border text-right">Preț unitar</th>
                        <th className="py-2 px-3 border text-right">Cantitate</th>
                        <th className="py-2 px-3 border text-right">Valoare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consum.liniiConsum.map((linie, itemIndex) => (
                        <tr key={itemIndex} className="hover:bg-gray-50">
                          <td className="py-2 px-3 border">{linie.id_bun}</td>
                          <td className="py-2 px-3 border">{linie.bun?.nume_bun || ""}</td>
                          <td className="py-2 px-3 border">{linie.bun?.unitate_masura || ""}</td>
                          <td className="py-2 px-3 border text-right">{(linie.bun?.pret_unitar || 0).toFixed(2)}</td>
                          <td className="py-2 px-3 border text-right">{linie.cantitate_necesara}</td>
                          <td className="py-2 px-3 border text-right">{linie.valoare.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100">
                        <td colSpan={5} className="py-2 px-3 border text-right font-bold">Total bon:</td>
                        <td className="py-2 px-3 border text-right font-bold">{consum.valoare.toFixed(2)} lei</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}

            <div className="text-right font-bold mt-4">
              Total gestiune: {gestiune.total.toFixed(2)} lei
            </div>
          </div>
        ))}

        <div className="text-right font-bold text-xl mt-8 border-t pt-4">
          Total general: {data.totalGeneral.toFixed(2)} lei
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-neutral-400 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <p className="bg-neutral-400 text-2xl text-white px-4 py-2 rounded flex items-center">Export ca:</p>
            <button
              onClick={generatePDF}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center transition ease-in-out duration-300 cursor-pointer"
              title="Export PDF"
            >
              <BsFiletypePdf size={25} />
            </button>
            <button
              onClick={generateDOCX}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center transition ease-in-out duration-300 cursor-pointer"
              title="Export DOCX"
            >
              <GrDocumentWord size={25} />
            </button>
            <button
              onClick={generateCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center transition ease-in-out duration-300 cursor-pointer"
              title="Export CSV"
            >
              <BsFiletypeCsv size={25} />
            </button>
          </div>
          <button
            className="bg-black hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center transition ease-in-out duration-300 cursor-pointer"
            onClick={() => {
              router.push("/consum")
            }}
            title="Înapoi"
          >
            <IoMdReturnLeft size={25} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-md shadow-md p-6 mb-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Eroare:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2">Se încarcă raportul...</span>
            </div>
          ) : reportData ? (
            <div className="print:p-0">
              <RenderReport data={reportData} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default ConsumptionReport;