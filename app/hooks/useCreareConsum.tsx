
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useConsumStore } from "@/app/store/consumStore";
import { Bun } from "@/lib/classes/Bun";
import { LinieConsum } from "@/lib/classes/LinieConsum";
import { Gestiune } from "@/lib/classes/Gestiune";
import { Angajat } from "@/lib/classes/Angajat";
import { CerereAprovizionare, StatusCerere } from "@/lib/classes/CerereAprovizionare";
import { mapToPrismaStatus } from "../utils/statusMapper";

// ============== tipuri speciale care ajuta la crearea formularului ==============

export interface BunInsuficient {
  bun: Bun
  cantitate_necesara: number | string;
}

export interface BunCerere {
  id_linie_cerere?: number;
  id_bun: number;
  nume_bun: string;
  cantitate: number;
  unitate_masura?: string;
  pret_unitar?: number | string;
  observatii?: string;
}

export function useCreareConsum() {
  const router = useRouter();

  const {
    angajati,
    gestiuni,
    bunuri,
    liniiConsum,
    setAngajati,
    setGestiuni,
    setBunuri,
    addLinieConsum,
    setLiniiConsum
  } = useConsumStore();

  // ================== state-uri (constante care folosesc setteri pentru actualizare) ============

  const [dataConsum, setDataConsum] = useState<string>(new Date().toISOString().split("T")[0]);
  const [gestiuneSelectata, setGestiuneSelectata] = useState<number | null>(null);
  const [responsabilSelectat, setResponsabilSelectat] = useState<number | null>(null);

  const [cereriAprovizionare, setCereriAprovizionare] = useState<CerereAprovizionare[]>([]);
  const [cerereExistenta, setCerereExistenta] = useState<CerereAprovizionare | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [bunSelectat, setBunSelectat] = useState<number | null>(null);
  const [cantitateNecesara, setCantitateNecesara] = useState<string>("");
  const [cantitateEliberata, setCantitateEliberata] = useState<string>("");

  const [valoareCalculata, setValoareCalculata] = useState<number>(0);
  const [showAlertaInsuficienta, setShowAlertaInsuficienta] = useState(false);
  const [showCerereAprovizionare, setShowCerereAprovizionare] = useState(false);
  const [bunCuCantitateInsuficienta, setBunCuCantitateInsuficienta] = useState<BunInsuficient | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // =========== functia de preluare a datelor din baza de date =============== 

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [resAng, resGest, resBun, resCereri] = await Promise.all([
        fetch("/api/angajat"),
        fetch("/api/gestiune"),
        fetch("/api/bun"),
        fetch("/api/cerere-aprovizionare"),
      ]);

      const [dataAng, dataGest, dataBun, dataCereri] = await Promise.all([
        resAng.json(),
        resGest.json(),
        resBun.json(),
        resCereri.json(),
      ]);

      setAngajati(dataAng.map((g: any) => Angajat.fromPrisma(g))); // dacă vrei și Angajat class, o putem crea
      setGestiuni(dataGest.map((g: any) => Gestiune.fromPrisma(g)));
      setBunuri(dataBun.map((b: any) => Bun.fromPrisma(b)));
      setCereriAprovizionare(dataCereri.map((b: any) => CerereAprovizionare.fromPrisma(b)));
    } catch (err) {
      toast.error("Eroare la încărcarea datelor inițiale");
    } finally {
      setIsLoading(false);
    }
  };

  //============ functie pentru preluarea datelor pe client ============== 

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ========= functie de gestionare a aparitiei existentei Cererii de aprovizionare 
  useEffect(() => {
    if (gestiuneSelectata) {
      const cerere = cereriAprovizionare.find(c => {
        console.log((c.getStatus()))
        const stat = StatusCerere[c.getStatus() as unknown as keyof typeof StatusCerere];
        const idPotrivit = Number(c.getIdGestiune()) === Number(gestiuneSelectata);

        // Verificăm statusul - știm acum că getStatus() returnează "IN_ASTEPTARE"
        const statusPotrivit = mapToPrismaStatus(stat) === "IN_ASTEPTARE";

        return idPotrivit && statusPotrivit;

      }
      );

      setCerereExistenta(cerere || null);
    } else {
      setCerereExistenta(null);
    }
  }, [gestiuneSelectata, cereriAprovizionare]);

  // ============= functie care ruleaza la fiecare introducere a bunului si a cantitatii eliberate
  useEffect(() => {
    if (bunSelectat && cantitateEliberata) {
      const bun = bunuri.find(b => b.getId() === bunSelectat);
      if (bun) {
        setValoareCalculata(bun.getPretUnitar() * parseFloat(cantitateEliberata));
      }
    } else {
      setValoareCalculata(0);
    }
  }, [bunSelectat, cantitateEliberata, bunuri]);

  // ================ Fct de adaugare bun in liniile de consum ================= 
  const adaugaBun = () => {
    if (!bunSelectat || !cantitateNecesara || !cantitateEliberata) {
      toast.error("Completați toate câmpurile obligatorii!");
      return;
    }

    const bun = bunuri.find(b => b.getId() === bunSelectat);
    if (!bun) return;

    const cantDisponibila = bun.getCantitateDisponibila();
    const cantDorita = parseFloat(cantitateEliberata);

    if (cantDorita > cantDisponibila) {
      setBunCuCantitateInsuficienta({
        bun: bun,
        cantitate_necesara: cantDorita,
      });
      setShowAlertaInsuficienta(true);
      return;
    }

    const linie = LinieConsum.fromBun(
      bun,
      parseFloat(cantitateNecesara),
      parseFloat(cantitateEliberata)
    );

    addLinieConsum(linie);
    inchideModal();
  };

  // =================== functie de resetare a modalului de adaugare bun pt urmatorul bun nou creat ================

  const resetFormModal = () => {
    setBunSelectat(null);
    setCantitateNecesara('');
    setCantitateEliberata('');
    setValoareCalculata(0);
  };

  // ============= functie de stergere a liniei =====================

  const stergeLinie = (index: number) => {
    const linieStearsa = liniiConsum[index];
    const noiLinii = [...liniiConsum];
    noiLinii.splice(index, 1);
    setLiniiConsum(noiLinii);
    toast.success(`Produsul "${linieStearsa.getBun()?.getNume()}" a fost eliminat!`, {
      icon: '🗑️',
    });
  };

  // ================ functie de editare a liniei =========================

  const editLinie = (index: number) => {
    const linie = liniiConsum[index];
    setBunSelectat(linie.getIdBun());
    setCantitateNecesara(linie.getCantitateNecesara().toString());
    setCantitateEliberata(linie.getCantitateEliberata().toString());

    // Notificăm utilizatorul că produsul a fost selectat pentru editare
    toastInfo(`Editare produs "${linie.getBun()?.getNume()}"`);
    // Ștergem linia veche și o vom adăuga pe cea nouă după editare
    stergeLinie(index);
    setModalVisible(true);
  };

  //============= functie de inchidere a modalului ===============

  const inchideModal = () => {
    setModalVisible(false);
    setBunSelectat(null);
    setCantitateNecesara("");
    setCantitateEliberata("");
    setValoareCalculata(0);
  };

  //================= Funcție pentru a gestiona anularea alertei de cantitate insuficientă==============
  const handleCancelAlertaInsuficienta = () => {
    setShowAlertaInsuficienta(false);
    setBunCuCantitateInsuficienta(null);
  };

  // ================= Funcție pentru a gestiona confirmarea alertei de cantitate insuficientă===========
  const handleConfirmAlertaInsuficienta = () => {
    setShowAlertaInsuficienta(false);
    setShowCerereAprovizionare(true);
  };


  //================== Funcție pentru a gestiona salvarea cererii de aprovizionare==============
  const handleSaveCerereAprovizionare = async (linii: BunCerere[]) => {
    try {
      // Obținem gestiunea selectată
      if (!gestiuneSelectata) {
        toast.error('Vă rugăm selectați o gestiune înainte de a crea o cerere de aprovizionare!');
        return;
      }

      const toastId = toast.loading('Se procesează cererea de aprovizionare...');

      // Filtrăm doar liniile care nu au id_linie_cerere (sunt noi)
      const liniiNoi = linii.filter(l => !l.id_linie_cerere);

      // Verificăm dacă avem linii pentru cerere
      if (liniiNoi.length === 0) {
        toast.error('Nu există bunuri de adăugat în cererea de aprovizionare!', { id: toastId });
        return;
      }

      // Calculăm valoarea totală a cererii (suma valorilor liniilor)
      const valoareTotala = liniiNoi.reduce((sum, linie) => {
        const bun = bunuri.find(b => b.getId() === linie.id_bun);
        // Folosim prețul estimat din bun sau 0 dacă nu există
        const valoareLinie = bun ? (bun.getPretUnitar() * linie.cantitate) : 0;
        return sum + valoareLinie;
      }, 0);

      // Pregătim datele pentru linii în formatul așteptat de API
      const liniiFormatate = liniiNoi.map(linie => {
        const bun = bunuri.find(b => b.getId() === linie.id_bun);
        const valoareLinie = bun ? (bun.getPretUnitar() * linie.cantitate) : 0;

        return {
          id_bun: linie.id_bun,
          cantitate: linie.cantitate,
          valoare: valoareLinie,
          observatii: linie.observatii || 'Cerere automată din consum'
        };
      });

      // Creăm cererea nouă
      const resCerere = await fetch('/api/cerere-aprovizionare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_gestiune: gestiuneSelectata,
          valoare: valoareTotala,
          status: 'IN_ASTEPTARE',
          linii: liniiFormatate
        }),
      });

      if (!resCerere.ok) {
        const errorData = await resCerere.json();
        throw new Error(`Eroare la crearea cererii: ${errorData.error || 'Eroare necunoscută'}`);
      }

      const cerere = await resCerere.json();

      // Adăugăm cererea nouă în state
      setCereriAprovizionare([...cereriAprovizionare, cerere]);
      setCerereExistenta(cerere);

      // Afișăm un mesaj de succes
      toast.success('Cererea de aprovizionare a fost creată cu succes!', { id: toastId, duration: 4000 });

      // Închidem modalele
      setShowCerereAprovizionare(false);
      setBunCuCantitateInsuficienta(null);

      // Resetăm formularul pentru a evita adăugarea automată a bunului
      resetFormModal();
    } catch (error) {
      console.error('Eroare la salvarea cererii:', error);
      toast.error(`A apărut o eroare la salvarea cererii: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
    }
  };

  // ============== functie de deschidere a ferestrei de adaugare bun
  const deschideModal = () => {
    setModalVisible(true);
    resetFormModal();
  };


  let linie = bunCuCantitateInsuficienta ? liniiConsum.filter(l => l.getIdBun() === bunCuCantitateInsuficienta.bun.getId()) : null;

  const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // ================== fct pt conversie valoare catre string ===============

  const formatNumber = (val: any): string => {
    return toNumber(val).toFixed(2);
  };

  //=============== functie de calculare a valorii totale pt a fi afisata pe client =================

  const getValoareTotala = () => {
    return liniiConsum.reduce((total, linie) => total + linie.getValoare(), 0);
  };

  //=============== functie de calculare a totalului cantitatii pt a fi afisata pe client =================

  const getCantitateaTotala = () => {
    return liniiConsum.reduce((total, linie) => total + linie.getCantitateEliberata(), 0);
  };


  //========== functie pentru momentul de salvare in baza de date a consumului ====================

  const salveazaConsum = async () => {
    if (!gestiuneSelectata || !responsabilSelectat || !dataConsum || liniiConsum.length === 0) {
      toast.error('Vă rugăm completați toate câmpurile obligatorii și adăugați cel puțin o linie de consum!');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Se salvează consumul...');



    // Construim obiectul pentru cererea API
    const dataCerere = {
      id_gestiune: Number(gestiuneSelectata),
      id_sef: Number(responsabilSelectat),
      data: dataConsum,
      linii: liniiConsum.map(linie => ({
        id_bun: Number(linie.getIdBun()),
        cantitate_necesara: Number(linie.getCantitateNecesara()),
        cant_eliberata: Number(linie.getCantitateEliberata()),
        valoare: Number(linie.getCantitateEliberata()) * Number(linie.getBun()?.getPretUnitar() ?? 0)
      }))
    };

    try {
      const response = await fetch('/api/consum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataCerere),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Consumul a fost înregistrat cu succes!', { id: toastId });
        router.push('/consum');
      } else {
        toast.error(`A apărut o eroare: ${responseData.error}`, { id: toastId });
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Eroare la salvarea consumului:', error);
      toast.error('A apărut o eroare la salvarea consumului.', { id: toastId });
      setIsSaving(false);
    }
  };

  //========== functie pentru momentul de renuntare la formularul de consum ====================

  const renunta = () => {
    // Dacă nu există modificări, redirecționăm direct
    if (!formDirty) {
      router.push('/consum');
      return;
    }

    // Arătăm un toast cu butoane de confirmare
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium">Sigur doriți să renunțați?</p>
          <p className="text-sm">Toate datele introduse vor fi pierdute.</p>
          <div className="flex justify-between mt-2">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-sm transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Anulare
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              onClick={() => {
                toast.dismiss(t.id);
                router.push('/consum');
              }}
            >
              Confirmă
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000, // Durată mai lungă pentru a permite utilizatorului să decidă
        position: 'top-center',
        style: {
          maxWidth: '320px',
          padding: '16px',
          borderRadius: '8px',
        },
      }
    );
  };
  return {
    angajati,
    gestiuni,
    bunuri,
    liniiConsum,
    gestiuneSelectata,
    setGestiuneSelectata,
    responsabilSelectat,
    setResponsabilSelectat,
    dataConsum,
    setDataConsum,
    modalVisible,
    setModalVisible,
    bunSelectat,
    setBunSelectat,
    cantitateNecesara,
    setCantitateNecesara,
    cantitateEliberata,
    setCantitateEliberata,
    valoareCalculata,
    adaugaBun,
    inchideModal,
    showAlertaInsuficienta,
    setShowAlertaInsuficienta,
    bunCuCantitateInsuficienta,
    setBunCuCantitateInsuficienta,
    showCerereAprovizionare,
    setShowCerereAprovizionare,
    cerereExistenta,
    isLoading,
    isSaving,
    setIsSaving,
    formDirty,
    setFormDirty,
    editLinie,
    stergeLinie,
    handleCancelAlertaInsuficienta,
    handleSaveCerereAprovizionare,
    deschideModal,
    handleConfirmAlertaInsuficienta,
    linie,
    formatNumber,
    getValoareTotala,
    getCantitateaTotala,
    salveazaConsum,
    renunta,
  };
}
const toastInfo = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#ffffff',
    },
  });
};

