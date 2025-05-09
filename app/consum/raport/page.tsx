'use client'

// ConsumptionReport.tsx
import React, { useState, useEffect } from 'react';
import * as _ from 'lodash';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import * as Papa from 'papaparse';

// Modele de date bazate pe schema Prisma
interface Gestiune {
  id_gestiune: number;
  denumire: string;
}

interface Bun {
  id_bun: number;
  nume_bun: string;
  unitate_masura?: string;
  pret_unitar?: number;
}

interface ConsumuriItem {
  cod: number;
  denumire: string;
  um: string;
  pret_unitar: number;
  cantitate: number;
  valoare: number;
}

interface GestiuneRaport {
  id: number;
  nume: string;
  consumuri: ConsumuriItem[];
  totalDocumente?: number[];
  total: number;
}

interface RaportConsum {
  title: string;
  perioada: string;
  gestiuni: GestiuneRaport[];
  totalGeneral: number;
}

// Funcție pentru crearea unui document Word-like
// Notă: Într-o aplicație reală, veți folosi biblioteca 'docx'
const createDocxBlob = (report: RaportConsum): Blob => {
  // Aici ar trebui să utilizați biblioteca docx pentru a genera un document DOCX real
  // Pentru simplitate, vom returna un text simplu ca blob
  let docxContent = `${report.title}\n`;
  docxContent += `în perioada ${report.perioada}\n\n`;

  report.gestiuni.forEach(gestiune => {
    docxContent += `${gestiune.nume}\n`;
    docxContent += `Cod\tDenumire\tUM\tPreț unitar\tCantitate\tValoare\n`;

    gestiune.consumuri.forEach(item => {
      docxContent += `${item.cod}\t${item.denumire}\t${item.um}\t${item.pret_unitar.toFixed(2)}\t${item.cantitate}\t${item.valoare.toFixed(2)}\n`;
    });

    docxContent += `Total gestiune: ${gestiune.total.toFixed(2)} lei\n\n`;
  });

  docxContent += `Total general: ${report.totalGeneral.toFixed(2)} lei`;

  return new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

const ConsumptionReport: React.FC = () => {
  const [reportData, setReportData] = useState<RaportConsum | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedGestiuni, setSelectedGestiuni] = useState<number[]>([]);
  const [selectedBunuri, setSelectedBunuri] = useState<number[]>([]);
  const [allGestiuni, setAllGestiuni] = useState<Gestiune[]>([]);
  const [allBunuri, setAllBunuri] = useState<Bun[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectAllGestiuni, setSelectAllGestiuni] = useState<boolean>(false);
  const [selectAllBunuri, setSelectAllBunuri] = useState<boolean>(false);

  // Funcție pentru formatarea datei
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Simulare date pentru demo
  useEffect(() => {
    // Simulare API call pentru gestiuni disponibile
    fetchGestiuni();
    fetchBunuri();
  }, []);

  // Funcții de fetch pentru a obține date de la API
  const fetchGestiuni = async (): Promise<void> => {
    try {
      // Într-o implementare reală, aici ar fi un apel către API
      // const response = await fetch('/api/gestiuni');
      // const data = await response.json();
      // setAllGestiuni(data);

      // Simulare date
      setAllGestiuni([
        { id_gestiune: 1, denumire: "Gestiunea A" },
        { id_gestiune: 2, denumire: "Gestiunea B" }
      ]);
    } catch (error) {
      console.error("Eroare la încărcarea gestiunilor:", error);
    }
  };

  const fetchBunuri = async (): Promise<void> => {
    try {
      // Într-o implementare reală, aici ar fi un apel către API
      // const response = await fetch('/api/bunuri');
      // const data = await response.json();
      // setAllBunuri(data);

      // Simulare date
      setAllBunuri([
        { id_bun: 1001, nume_bun: "Făină" },
        { id_bun: 1002, nume_bun: "Zahăr" },
        { id_bun: 1003, nume_bun: "Mere" },
        { id_bun: 1004, nume_bun: "Ulei" },
        { id_bun: 1005, nume_bun: "Orez" },
        { id_bun: 1006, nume_bun: "Carne pui" },
        { id_bun: 1007, nume_bun: "Cartofi" }
      ]);
    } catch (error) {
      console.error("Eroare la încărcarea bunurilor:", error);
    }
  };

  // Simulare date raport
  const fetchReportData = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Într-o implementare reală, aici ar fi un apel către API
      // const queryParams = new URLSearchParams();
      // queryParams.append('dataStart', startDate);
      // queryParams.append('dataEnd', endDate);
      // if (selectedGestiuni.length > 0 && !selectAllGestiuni) {
      //   queryParams.append('gestiuni', selectedGestiuni.join(','));
      // }
      // if (selectedBunuri.length > 0 && !selectAllBunuri) {
      //   queryParams.append('bunuri', selectedBunuri.join(','));
      // }
      // const response = await fetch(`/api/rapoarte/consum?${queryParams.toString()}`);
      // const data = await response.json();
      // setReportData(data);

      // Simulare răspuns de la API cu delay
      setTimeout(() => {
        setReportData({
          title: "Centralizatorul consumurilor pe gestiuni",
          perioada: `${formatDate(startDate)} - ${formatDate(endDate)}`,
          gestiuni: [
            {
              id: 1,
              nume: "Gestiunea A",
              consumuri: [
                { cod: 1001, denumire: "Făină", um: "kg", pret_unitar: 2.50, cantitate: 50, valoare: 125.00 },
                { cod: 1002, denumire: "Zahăr", um: "kg", pret_unitar: 3.00, cantitate: 30, valoare: 90.00 },
                { cod: 1003, denumire: "Mere", um: "kg", pret_unitar: 2.20, cantitate: 20, valoare: 44.00 }
              ],
              total: 259.00
            },
            {
              id: 2,
              nume: "Gestiunea B",
              consumuri: [
                { cod: 1004, denumire: "Ulei", um: "l", pret_unitar: 6.00, cantitate: 25, valoare: 150.00 },
                { cod: 1005, denumire: "Orez", um: "kg", pret_unitar: 4.00, cantitate: 40, valoare: 160.00 },
              ],
              totalDocumente: [310.00],
              total: 310.00
            },
            {
              id: 3,
              nume: "Gestiunea B",
              consumuri: [
                { cod: 1006, denumire: "Carne pui", um: "kg", pret_unitar: 10.00, cantitate: 35, valoare: 350.00 },
                { cod: 1007, denumire: "Cartofi", um: "kg", pret_unitar: 1.80, cantitate: 60, valoare: 108.00 }
              ],
              totalDocumente: [458.00],
              total: 458.00
            }
          ],
          totalGeneral: 1027.00
        });
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Eroare la încărcarea datelor raportului:", error);
      setIsLoading(false);
    }
  };

  const handleToggleAllGestiuni = (): void => {
    setSelectAllGestiuni(!selectAllGestiuni);
    if (!selectAllGestiuni) {
      setSelectedGestiuni(allGestiuni.map(g => g.id_gestiune));
    } else {
      setSelectedGestiuni([]);
    }
  };

  const handleToggleAllBunuri = (): void => {
    setSelectAllBunuri(!selectAllBunuri);
    if (!selectAllBunuri) {
      setSelectedBunuri(allBunuri.map(b => b.id_bun));
    } else {
      setSelectedBunuri([]);
    }
  };

  const generatePDF = (): void => {
    if (!reportData) return;

    const doc = new jsPDF();

    // Titlu
    doc.setFontSize(16);
    doc.text(reportData.title, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`în perioada ${reportData.perioada}`, 105, 30, { align: 'center' });

    let yPosition = 40;
    let pageNumber = 1;

    // Pentru fiecare gestiune
    reportData.gestiuni.forEach((gestiune, gestiuneIndex) => {
      // Verifică dacă avem suficient spațiu pe pagină, altfel adaugă o pagină nouă
      if (yPosition > 250) {
        doc.addPage();
        pageNumber++;
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(gestiune.nume, 20, yPosition);
      yPosition += 10;

      // Tabel header
      doc.setFontSize(10);
      doc.text("Cod", 20, yPosition);
      doc.text("Denumire", 40, yPosition);
      doc.text("UM", 100, yPosition);
      doc.text("Preț unitar", 120, yPosition);
      doc.text("Cantitate", 150, yPosition);
      doc.text("Valoare", 180, yPosition);
      yPosition += 5;

      // Linie sub header
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;

      // Date tabel
      gestiune.consumuri.forEach(item => {
        doc.text(item.cod.toString(), 20, yPosition);
        doc.text(item.denumire, 40, yPosition);
        doc.text(item.um, 100, yPosition);
        doc.text(item.pret_unitar.toFixed(2), 120, yPosition);
        doc.text(item.cantitate.toString(), 150, yPosition);
        doc.text(item.valoare.toFixed(2), 180, yPosition);
        yPosition += 7;
      });

      // Total document
      if (gestiune.totalDocumente && gestiune.totalDocumente.length > 0) {
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
        doc.text(`Total document: ${gestiune.totalDocumente[0].toFixed(2)} lei`, 140, yPosition);
        yPosition += 7;
      }

      // Total gestiune
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      doc.text(`Total gestiune: ${gestiune.total.toFixed(2)} lei`, 140, yPosition);
      yPosition += 15;
    });

    // Total general
    doc.setFontSize(12);
    doc.text(`Total general: ${reportData.totalGeneral.toFixed(2)} lei`, 140, yPosition);

    // Footer cu număr pagină
    for (let i = 1; i <= pageNumber; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Pagina ${i} din ${pageNumber}`, 105, 290, { align: 'center' });
    }

    doc.save('raport_consum.pdf');
  };

  const generateDOCX = (): void => {
    if (!reportData) return;
    const blob = createDocxBlob(reportData);
    saveAs(blob, "raport_consum.docx");
  };

  const generateCSV = (): void => {
    if (!reportData) return;

    const csvData: any[][] = [];

    // Header
    csvData.push(["Gestiune", "Cod", "Denumire", "UM", "Preț unitar", "Cantitate", "Valoare"]);

    // Data
    reportData.gestiuni.forEach(gestiune => {
      gestiune.consumuri.forEach(item => {
        csvData.push([
          gestiune.nume,
          item.cod,
          item.denumire,
          item.um,
          item.pret_unitar,
          item.cantitate,
          item.valoare
        ]);
      });

      // Add empty row + total for gestiune
      csvData.push([]);
      csvData.push(["Total gestiune", "", "", "", "", "", gestiune.total]);
    });

    // Total general
    csvData.push([]);
    csvData.push(["Total general", "", "", "", "", "", reportData.totalGeneral]);

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "raport_consum.csv");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sistem de gestiune</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:underline">Acasă</a></li>
              <li><a href="#" className="hover:underline">Rapoarte</a></li>
              <li><a href="#" className="hover:underline">Gestiuni</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-md shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Vizualizare raport consum</h2>

          {!reportData ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Date despre raport</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="allGestiuni"
                      className="mr-2"
                      checked={selectAllGestiuni}
                      onChange={handleToggleAllGestiuni}
                    />
                    <label htmlFor="allGestiuni" className="text-gray-700">Toate gestiunile</label>
                  </div>
                  <select
                    className="w-full border border-gray-300 rounded p-2"
                    multiple
                    value={selectedGestiuni.map(String)}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setSelectedGestiuni(values);
                    }}
                    disabled={selectAllGestiuni}
                  >
                    {allGestiuni.map(gestiune => (
                      <option key={gestiune.id_gestiune} value={gestiune.id_gestiune}>
                        {gestiune.denumire}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="allBunuri"
                      className="mr-2"
                      checked={selectAllBunuri}
                      onChange={handleToggleAllBunuri}
                    />
                    <label htmlFor="allBunuri" className="text-gray-700">Toate bunurile</label>
                  </div>
                  <select
                    className="w-full border border-gray-300 rounded p-2"
                    multiple
                    value={selectedBunuri.map(String)}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setSelectedBunuri(values);
                    }}
                    disabled={selectAllBunuri}
                  >
                    {allBunuri.map(bun => (
                      <option key={bun.id_bun} value={bun.id_bun}>
                        {bun.nume_bun}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium mb-4">Perioada de raportare</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center">
                    <span className="mr-2">de la</span>
                    <input
                      type="date"
                      className="border border-gray-300 rounded p-2"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">până la</span>
                    <input
                      type="date"
                      className="border border-gray-300 rounded p-2"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
                  onClick={() => {
                    setSelectedGestiuni([]);
                    setSelectedBunuri([]);
                    setStartDate("");
                    setEndDate("");
                    setSelectAllGestiuni(false);
                    setSelectAllBunuri(false);
                  }}
                >
                  Renunță
                </button>
                <button
                  className="bg-black hover:bg-gray-800 text-white px-8 py-2 rounded"
                  onClick={fetchReportData}
                  disabled={isLoading || (!startDate || !endDate)}
                >
                  {isLoading ? "Se încarcă..." : "Ok"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">{reportData.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={generatePDF}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <span className="mr-1">PDF</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={generateDOCX}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <span className="mr-1">DOCX</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={generateCSV}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <span className="mr-1">CSV</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-6">în perioada {reportData.perioada}</p>

              {reportData.gestiuni.map((gestiune, index) => (
                <div key={`${gestiune.id}-${index}`} className="mb-8">
                  <h4 className="text-lg font-medium mb-2">{gestiune.nume}</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Cod</th>
                          <th className="px-4 py-2 text-left">Denumire</th>
                          <th className="px-4 py-2 text-left">UM</th>
                          <th className="px-4 py-2 text-right">Preț unitar</th>
                          <th className="px-4 py-2 text-right">Cantitate</th>
                          <th className="px-4 py-2 text-right">Valoare</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gestiune.consumuri.map((item) => (
                          <tr key={`${gestiune.id}-${item.cod}`} className="border-b">
                            <td className="px-4 py-2">{item.cod}</td>
                            <td className="px-4 py-2">{item.denumire}</td>
                            <td className="px-4 py-2">{item.um}</td>
                            <td className="px-4 py-2 text-right">{item.pret_unitar.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{item.cantitate.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">{item.valoare.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        {gestiune.totalDocumente && gestiune.totalDocumente.length > 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-2 text-right font-medium">
                              Total document:
                            </td>
                            <td className="px-4 py-2 text-right font-medium">
                              {gestiune.totalDocumente[0].toFixed(2)} lei
                            </td>
                          </tr>
                        ) : null}
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-right font-bold">
                            Total gestiune:
                          </td>
                          <td className="px-4 py-2 text-right font-bold">
                            {gestiune.total.toFixed(2)} lei
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 text-right">
                <p className="text-xl font-bold">
                  Total general: {reportData.totalGeneral.toFixed(2)} lei
                </p>
              </div>

              <div className="mt-6">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  onClick={() => setReportData(null)}
                >
                  Înapoi la filtre
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Sistem de Gestiune. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  );
};

export default ConsumptionReport;