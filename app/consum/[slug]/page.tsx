'use client'

import Sidebar from '@/app/components/Sidebar';
import { ArrowLeftFromLine, ArrowRightFromLine, Calendar, Edit, FileCheck, Loader2, Package2, Plus, Save, ShieldAlert, ShoppingCart, Trash2, X } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { File } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import ModalCerereAprovizionare from '@/app/components/ModalCerereAprovizionare';
import ConsumAlertaCantitateInsuficienta from '@/app/components/ConsumAlertaCantitateInsuficienta';

const toastInfo = (message: string) => {
    toast(message, {
        icon: 'ℹ️',
        style: {
            background: '#3B82F6',
            color: '#ffffff',
        },
    });
};

interface Consum {
    id_consum: number,
    valoare: number,
    data: Date,
    id_sef: number,  // Modificat pentru a reflecta structura înainte de JOIN
    id_gestiune: number,  // Modificat pentru a reflecta structura înainte de JOIN
    sef?: Angajat,  // Opțional, dacă relația nu este încărcată
    gestiune?: Gestiune  // Opțional, dacă relația nu este încărcată
    liniiConsum?: LinieConsum[]
}

// Interfețe pentru modelele de date
interface Angajat {
    id_angajat: number;
    nume_angajat: string;
    prenume_angajat: string;
    functie: string;
}

interface Gestiune {
    id_gestiune: number;
    denumire: string;
    id_gestionar: number;
}

interface Bun {
    id_bun: number;
    nume_bun: string;
    cantitate_disponibila: number | string;
    pret_unitar: number | string;
    unitate_masura: string;
}

interface LinieConsum {
    id_bun: number;
    nume_bun: string;
    cantitate_necesara: number;
    um: string;
    cant_eliberata: number;
    pret_unitar: number;
    valoare: number;
    bun: Bun
}

interface BunInsuficient {
    id_bun: number;
    nume_bun: string;
    cantitate_disponibila: number | string;
    cantitate_necesara: number | string;
}

// Adăugat proprietățile lipsă
interface BunCerere {
    id_linie_cerere?: number; // Adăugat proprietatea lipsă
    id_bun: number;
    nume_bun: string;
    cantitate: number;
    unitate_masura?: string;
    pret_unitar?: number | string;
    observatii?: string; // Adăugat proprietatea lipsă
}

// Adăugat interfața pentru cerere
interface CerereAprovizionare {
    id_cerere: number;
    id_gestiune: number;
    data: string | Date;
    valoare: number;
    status: string;
}

interface ConsumParams {
    slug: string,
    isView: boolean
}


const page = ({ params }: { params: ConsumParams }) => {
    //luam parametrii
    const paramss = useParams();
    const searchParams = useSearchParams();
    const viewParam = searchParams.get("view");
    const viewVal = viewParam !== "false" && viewParam !== null;


    console.log(viewVal)

    //router pentru schimbul paginilor
    const router = useRouter();

    //states
    const [consum, setConsum] = useState<Consum>();
    const [gestiune, setGestiune] = useState<Gestiune>();
    const [angajat, setAngajat] = useState<Angajat>();
    const [liniiConsum, setLiniiConsum] = useState<LinieConsum[]>([]);
    const [view, setView] = useState(viewVal)

    console.log(view)




    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // Adăugat state pentru cereri de aprovizionare
    const [cereriAprovizionare, setCereriAprovizionare] = useState<CerereAprovizionare[]>([]);
    const [cerereExistenta, setCerereExistenta] = useState<CerereAprovizionare | null>(null);

    //state-uri pt navigare 
    const [consumuri, setConsumuri] = useState<Consum[]>([]);



    //State-uri editare
    const [gestiuneSelectata, setGestiuneSelectata] = useState<number | null>(null);
    const [responsabilSelectat, setResponsabilSelectat] = useState<number | null>(null);
    const [dataConsum, setDataConsum] = useState<string>(new Date().toISOString().split('T')[0]);
    const [liniiConsum2, setLiniiConsum2] = useState<LinieConsum[]>([]);

    // State pentru datele din backend
    const [gestiuni, setGestiuni] = useState<Gestiune[]>([]);
    const [angajati, setAngajati] = useState<Angajat[]>([]);
    const [bunuri, setBunuri] = useState<Bun[]>([]);

    // Adăugat state pentru cereri de aprovizionare
    const [cereriAprovizionare2, setCereriAprovizionare2] = useState<CerereAprovizionare[]>([]);
    const [cerereExistenta2, setCerereExistenta2] = useState<CerereAprovizionare | null>(null);

    // State pentru modal adăugare bun
    const [modalVisible, setModalVisible] = useState(false);
    const [bunSelectat, setBunSelectat] = useState<number | null>(null);
    const [cantitateNecesara, setCantitateNecesara] = useState<string>('');
    const [cantitateEliberata, setCantitateEliberata] = useState<string>('');
    const [valoareCalculata, setValoareCalculata] = useState<number>(0);

    // State pentru modale cerere aprovizionare
    const [showAlertaInsuficienta, setShowAlertaInsuficienta] = useState(false);
    const [showCerereAprovizionare, setShowCerereAprovizionare] = useState(false);
    const [bunCuCantitateInsuficienta, setBunCuCantitateInsuficienta] = useState<BunInsuficient | null>(null);

    // State pentru interactivitate
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
    const [pageLoaded, setPageLoaded] = useState(false);



    //State pt formDirty
    const [formDirty, setFormDirty] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3000/api/consum')
            .then(res => res.json())
            .then(data => setConsumuri(data));
    }, []);

    //identificarea id-ului si pozitiei specifice a consumului


    const id_consum = Number(paramss.slug);

    const indexCurent = consumuri.findIndex(c => c.id_consum === id_consum)

    let consumUrmator;

    const consumAnterior =
        indexCurent === 0 ? consumuri[consumuri.length - 1] : consumuri[indexCurent - 1];

    if (indexCurent === consumuri.length - 1) {
        consumUrmator = consumuri[0]
    } else {
        consumUrmator = consumuri[indexCurent + 1] || null
    }


    const fetchConsum = async () => {
        setLoading(true)

        try {
            const consum = await fetch(`http://localhost:3000/api/consum/${id_consum}`).then(res => res.json());
            const cereriData = await fetch('/api/cerere-aprovizionare').then(res => res.json());

            setConsum(consum)
            setGestiune(consum.gestiune)
            setAngajat(consum.sef)
            setDataConsum(consum.data)
            setResponsabilSelectat(consum.sef.id_angajat)
            setGestiuneSelectata(consum.gestiune.id_gestiune)
            setLiniiConsum(consum.liniiConsum)
            setCereriAprovizionare(cereriData)
        } catch (error) {
            console.log("Eroare: " + error);
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const getValoareTotala = () => {
        return liniiConsum.reduce((total, linie) => Number(total) + Number(linie.valoare), 0);
    };

    // Calculare cantitate totală de bunuri
    const getCantitateaTotala = () => {
        return liniiConsum.reduce((total, linie) => Number(total) + Number(linie.cant_eliberata), 0);
    };

    const formatNumber = (val: any): string => {
        return toNumber(val).toFixed(2);
    };

    const toNumber = (val: any): number => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    useEffect(() => {
        fetchConsum()

    }, [])

    useEffect(() => {
        if (gestiune) {
            const cerere = cereriAprovizionare.find(c =>
                c.id_gestiune === gestiune.id_gestiune &&
                c.status === 'IN_ASTEPTARE'
            );
            setCerereExistenta(cerere || null);
        } else {
            setCerereExistenta(null);
        }
    }, [gestiune, cereriAprovizionare]);

    const dataFormatata = new Date(consum?.data ?? '').toLocaleDateString('ro-RO');
    const dataFormatataISO = consum?.data ? new Date(consum.data).toISOString().split('T')[0] : '';

    // fct stergere consum
    const delConsum = async () => {
        setLoading(true);

        try {
            const res = await fetch(`http://localhost:3000/api/consum/${id_consum}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })


            toast.success('Consumul a fost sters cu succes!');
            router.push('/consum');
        } catch (error) {
            console.log("Eroare: " + error)
            toast.error(`A apărut o eroare la stergere: ${error}`);
            setError(true)
        }
    }

    //fct edit

    const toggleEditViewConsum = () => {
        setLoading(true)
        setView(!view)
        router.push(`/consum/${id_consum}?view=${view}`)
    }

    // Functii update 
    const showNotification = (message: string) => {
        setNotificationMessage(message);
        setTimeout(() => {
            setNotificationMessage(null);
        }, 3000);
    };

    // Încarcă datele inițiale
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                // În aplicația reală, aceste date ar trebui preluate de la API
                const gestiuniData = await fetch('/api/gestiune').then(res => res.json());
                const angajatiData = await fetch('/api/angajat').then(res => res.json());
                const bunuriData = await fetch('/api/bun').then(res => res.json());
                // Adăugat cereri de aprovizionare
                const cereriData = await fetch('/api/cerere-aprovizionare').then(res => res.json());

                setGestiuni(gestiuniData);
                setAngajati(angajatiData);
                setBunuri(bunuriData);
                setCereriAprovizionare(cereriData);

                // Simulăm încărcarea completă
                setTimeout(() => {
                    setIsLoading(false);
                    setPageLoaded(true);
                }, 300);
            } catch (error) {
                console.error('Eroare la încărcarea datelor:', error);
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Calculează valoarea atunci când se schimbă cantitatea sau bunul selectat
    useEffect(() => {
        if (bunSelectat && cantitateEliberata) {
            const bun = bunuri.find(b => b.id_bun === bunSelectat);
            if (bun) {
                const pretUnitar = toNumber(bun.pret_unitar);
                setValoareCalculata(pretUnitar * parseFloat(cantitateEliberata));
            }
        } else {
            setValoareCalculata(0);
        }
    }, [bunSelectat, cantitateEliberata, bunuri]);

    // Verificăm dacă există cerere de aprovizionare când se schimbă gestiunea selectată
    useEffect(() => {
        if (gestiuneSelectata) {
            const cerere = cereriAprovizionare.find(c =>
                c.id_gestiune === gestiuneSelectata &&
                c.status === 'IN_ASTEPTARE'
            );
            setCerereExistenta(cerere || null);
        } else {
            setCerereExistenta(null);
        }
    }, [gestiuneSelectata, cereriAprovizionare]);

    useEffect(() => {
        // Verifică dacă utilizatorul a făcut modificări
        if (gestiuneSelectata || responsabilSelectat || liniiConsum.length > 0) {
            setFormDirty(true);
        }
    }, [gestiuneSelectata, responsabilSelectat, liniiConsum]);

    // Funcții pentru gestionarea acțiunilor
    const deschideModal = () => {
        setModalVisible(true);
        resetFormModal();
    };

    const inchideModal = () => {
        setModalVisible(false);
        resetFormModal();
    };

    const resetFormModal = () => {
        setBunSelectat(null);
        setCantitateNecesara('');
        setCantitateEliberata('');
        setValoareCalculata(0);
    };

    // Funcție pentru a verifica și adăuga un bun
    const adaugaBun = () => {
        if (!bunSelectat || !cantitateNecesara || !cantitateEliberata) {
            toast.error('Vă rugăm completați toate câmpurile obligatorii!');
        }

        const bunGasit = bunuri.find(b => b.id_bun === bunSelectat);
        if (!bunGasit) return;

        const cantitateDisponibila = toNumber(bunGasit.cantitate_disponibila);
        const cantitateDorita = parseFloat(cantitateEliberata);

        // Verificăm dacă avem suficient stoc
        if (cantitateDorita > cantitateDisponibila) {
            // Arătăm alerta de cantitate insuficientă
            setBunCuCantitateInsuficienta({
                id_bun: bunGasit.id_bun,
                nume_bun: bunGasit.nume_bun,
                cantitate_disponibila: cantitateDisponibila,
                cantitate_necesara: cantitateDorita
            });
            setShowAlertaInsuficienta(true);
            return;
        }

        // Dacă avem suficient stoc, continuăm normal
        const noualinie: LinieConsum = {
            id_bun: bunGasit.id_bun,
            nume_bun: bunGasit.nume_bun,
            cantitate_necesara: parseFloat(cantitateNecesara),
            um: bunGasit.unitate_masura,
            cant_eliberata: cantitateDorita,
            pret_unitar: toNumber(bunGasit.pret_unitar),
            valoare: valoareCalculata,
            bun: bunGasit
        };

        setLiniiConsum([...liniiConsum, noualinie]);
        toast.success(`Bunul "${bunGasit.nume_bun}" a fost adăugat cu succes!`);
        inchideModal();
    };

    const stergeLinie = (index: number) => {
        const linieStearsa = liniiConsum[index];
        const noiLinii = [...liniiConsum];
        noiLinii.splice(index, 1);
        setLiniiConsum(noiLinii);
        toast.success(`Produsul "${linieStearsa.nume_bun}" a fost eliminat!`, {
            icon: '🗑️',
        });
    };

    const editLinie = (index: number) => {
        const linie = liniiConsum[index];
        setBunSelectat(linie.id_bun);
        setCantitateNecesara(linie.cantitate_necesara.toString());
        setCantitateEliberata(linie.cant_eliberata.toString());

        // Notificăm utilizatorul că produsul a fost selectat pentru editare
        toastInfo(`Editare produs "${linie.nume_bun}"`);
        // Ștergem linia veche și o vom adăuga pe cea nouă după editare
        stergeLinie(index);
        setModalVisible(true);
    };
    // Funcție pentru a gestiona confirmarea alertei de cantitate insuficientă
    const handleConfirmAlertaInsuficienta = () => {
        setShowAlertaInsuficienta(false);
        setShowCerereAprovizionare(true);
    };

    // Funcție pentru a gestiona anularea alertei de cantitate insuficientă
    const handleCancelAlertaInsuficienta = () => {
        setShowAlertaInsuficienta(false);
        setBunCuCantitateInsuficienta(null);
    };

    // Funcție pentru a gestiona salvarea cererii de aprovizionare
    const handleSaveCerereAprovizionare = async (linii: BunCerere[]) => {
        try {
            // Obținem gestiunea selectată
            if (!gestiuneSelectata) {
                toast.error('Vă rugăm selectați o gestiune înainte de a crea o cerere de aprovizionare!');
                return;
            }

            const toastId = toast.loading('Se procesează cererea de aprovizionare...');
            // Construim o variabilă pentru a stoca ID-ul cererii
            let idCerere: number;

            // Verificăm dacă cererea a fost deja creată (în caz că am editat liniile)
            const cerereExistentaIndex = cereriAprovizionare.findIndex(c =>
                c.id_gestiune === gestiuneSelectata &&
                c.status === 'IN_ASTEPTARE'
            );

            if (cerereExistentaIndex >= 0) {
                // Dacă există deja o cerere în așteptare pentru această gestiune, o folosim pe aceasta
                idCerere = cereriAprovizionare[cerereExistentaIndex].id_cerere;
            } else {
                // Altfel, creăm o cerere nouă
                const resCerere = await fetch('/api/cerere-aprovizionare', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_gestiune: gestiuneSelectata
                    }),
                });

                if (!resCerere.ok) {
                    throw new Error('Eroare la crearea cererii de aprovizionare');
                }

                const cerere = await resCerere.json();
                idCerere = cerere.id_cerere;

                // Adăugăm cererea nouă în state
                setCereriAprovizionare([...cereriAprovizionare, cerere]);
                setCerereExistenta(cerere);
            }

            // Adăugăm fiecare linie în cerere (doar cele care nu au id_linie_cerere)
            for (const linie of linii.filter(l => !l.id_linie_cerere)) {
                const bun = bunuri.find(b => b.id_bun === linie.id_bun);
                if (!bun) continue;

                await fetch('/api/linie-cerere-aprovizionare', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_cerere: idCerere,
                        id_bun: linie.id_bun,
                        cantitate: linie.cantitate,
                        observatii: linie.observatii || 'Cerere automată din consum'
                    }),
                });
            }

            // Afișăm un mesaj de succes cu informații suplimentare
            toast.success('Cererea de aprovizionare a fost creată cu succes!', { id: toastId, duration: 4000 });

            // Închidem modalele
            setShowCerereAprovizionare(false);
            setBunCuCantitateInsuficienta(null);

            // Resetăm formularul pentru a evita adăugarea automată a bunului
            resetFormModal();

        } catch (error) {
            console.error('Eroare la salvarea cererii:', error);
            toast.error('A apărut o eroare la salvarea cererii de aprovizionare!');

        }
    };

    const salveazaConsum = async () => {
        if (!gestiuneSelectata || !responsabilSelectat || !dataConsum || liniiConsum.length === 0) {
            toast.error('Vă rugăm completați toate câmpurile obligatorii și adăugați cel puțin o linie de consum!');
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading('Se actualizeaza consumul...');

        // Calculăm valoarea totală
        const valoareTotala = liniiConsum.reduce((total, linie) => total + linie.valoare, 0);

        // Construim obiectul pentru cererea API
        const dataCerere = {
            id_gestiune: Number(gestiuneSelectata),
            id_sef: Number(responsabilSelectat),
            data: dataFormatata,
            linii: liniiConsum.map(linie => ({
                id_bun: Number(linie.bun.id_bun),
                cantitate_necesara: Number(linie.cantitate_necesara),
                cant_eliberata: Number(linie.cant_eliberata)
            }))
        };

        try {
            const response = await fetch(`/api/consum/${id_consum}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataCerere),
            });

            const responseData = await response.json();

            if (response.ok) {
                toast.success('Consumul a fost actualizat cu succes!', { id: toastId });
                router.push('/consum');
            } else {
                toast.error(`A apărut o eroare: ${responseData.error}`, { id: toastId });
                setIsSaving(false);
            }
        } catch (error) {
            console.error('Eroare la actualizarea consumului:', error);
            toast.error('A apărut o eroare la actualizarea consumului.', { id: toastId });
            setIsSaving(false);
        }
    };

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



    return (
        <div className='flex gap-5'>
            <div className='w-1/5'>
                <Sidebar />
            </div>
            <div className="flex justify-center w-4/5 mt-5">

                {/*Partea true - de view - vizualizare*/}
                {
                    view ? (
                        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden ">
                            <div className="bg-gradient-to-r from-gray-800 to-black text-white p-5 px-10">
                                <h1 className="text-3xl font-serif text-center flex items-center justify-center gap-3">
                                    <File className='w-7 h-7 text-red-600' />
                                    Bonul de consum nr. {consum?.id_consum}
                                </h1>
                            </div>
                            <div className='p-5'>
                                <div className="mb-6 grid grid-cols-4 gap-4 items-center">

                                    <label className="text-right font-serif text-lg">Gestiune:</label>
                                    <div className="col-span-3">
                                        <div className="p-2.5 border border-gray-300 bg-gray-100 rounded-lg text-gray-800">
                                            {gestiune?.denumire || '—'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 grid grid-cols-4 gap-4 items-center">

                                    <label className="text-right font-serif text-lg">Responsabil:</label>
                                    <div className="col-span-3">
                                        <div className="p-2.5 border border-gray-300 bg-gray-100 rounded-lg text-gray-800">
                                            {angajat ? `${angajat.nume_angajat} ${angajat.prenume_angajat}` : '—'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 grid grid-cols-4 gap-4 items-center">
                                    <label className="text-right font-serif text-lg">Data:</label>
                                    <div className="col-span-3 relative">
                                        <div className="w-full p-2.5 border border-gray-300 bg-gray-100 rounded-lg text-gray-800 pr-10">
                                            {dataFormatata}
                                        </div>
                                        <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                                            <Calendar size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-300 col-span-4 my-6"></div>

                                {cerereExistenta && (
                                    <div className="col-span-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
                                        <div className="bg-blue-500 p-2 rounded-full text-white flex-shrink-0">
                                            <ShoppingCart size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-blue-700">Cerere de aprovizionare în așteptare</h3>
                                            <p className="text-sm text-blue-600">
                                                Există o cerere de aprovizionare în așteptare pentru această gestiune (ID: {cerereExistenta.id_cerere}).
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-4 mb-4">
                                    <h2 className="text-2xl font-serif mb-4">Bunuri utilizate</h2>

                                    {/* Buton pentru adăugare - eliminat în vizualizare */}
                                    {/* <button onClick={...}>Adaugă bun de pe stoc</button> */}

                                    <div className="bg-red-600 rounded-lg p-4 shadow-md">
                                        <div className="overflow-x-auto">
                                            <table className="w-full bg-white rounded-md overflow-hidden">
                                                <thead>
                                                    <tr className="bg-gray-800 text-white">
                                                        <th className="p-3 text-left">Denumire bun</th>
                                                        <th className="p-3 text-center">Cant. necesară</th>
                                                        <th className="p-3 text-center">UM</th>
                                                        <th className="p-3 text-center">Cant. eliberată</th>
                                                        <th className="p-3 text-center">Preț unitar</th>
                                                        <th className="p-3 text-center">Valoare</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {liniiConsum.length > 0 ? (

                                                        liniiConsum.map((linie, index) => (
                                                            <tr
                                                                key={index}
                                                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <td className="p-3 border-r">{linie.bun.nume_bun}</td>
                                                                <td className="p-3 border-r text-center">{linie.cantitate_necesara}</td>
                                                                <td className="p-3 border-r text-center">{linie.bun.unitate_masura}</td>
                                                                <td className="p-3 border-r text-center">{linie.cant_eliberata}</td>
                                                                <td className="p-3 border-r text-center">{linie.bun.pret_unitar}</td>
                                                                <td className="p-3 border-r text-center font-medium">{linie.valoare}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={6} className="p-6 text-center text-gray-500">
                                                                <Package2 className="mx-auto mb-2" size={24} />
                                                                <p>Nu există bunuri adăugate.</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                                {liniiConsum.length > 0 && (
                                                    <tfoot>
                                                        <tr className="bg-gray-100 border-t border-gray-300 font-medium">
                                                            <td className="p-3">Total</td>
                                                            <td className="p-3"></td>
                                                            <td className="p-3"></td>
                                                            <td className="p-3 text-center">{formatNumber(getCantitateaTotala())}</td>
                                                            <td className="p-3"></td>
                                                            <td className="p-3 text-center font-bold">{formatNumber(getValoareTotala())}</td>
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-8">
                                    {
                                        consumAnterior ?
                                            (
                                                <Link href={`/consum/${consumAnterior.id_consum}`} className="bg-neutral-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-neutral-700 transition-colors shadow hover:shadow-md"><ArrowLeftFromLine /></Link>
                                            ) : null
                                    }
                                    <div className='flex gap-5'>
                                        <button
                                            onClick={delConsum}
                                            className="bg-red-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors shadow hover:shadow-md"
                                        //disabled={isSaving}
                                        >
                                            <Trash2 />
                                            Sterge
                                        </button>

                                        <button
                                            onClick={toggleEditViewConsum}
                                            className="bg-black text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors shadow hover:shadow-md"

                                        >
                                            {/* {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Salvare...
                                    </>
                                ) : (
                                    <>
                                        
                                    </>
                                )} */}
                                            <Edit size={16} />
                                            Editeaza
                                        </button>

                                    </div>
                                    {
                                        consumUrmator ? (
                                            <Link href={`/consum/${consumUrmator.id_consum}`} className="bg-neutral-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-neutral-700 transition-colors shadow hover:shadow-md"><ArrowRightFromLine /></Link>
                                        ) : null
                                    }
                                </div>
                            </div>

                        </div>
                    ) : (
                        // Partea de editare
                        <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen p-6 md:p-8 transition-opacity duration-500 opacity-100">
                            {/* Notification */}
                            {notificationMessage && (
                                <div className="fixed top-4 right-4 bg-black text-white p-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in-slide">
                                    <FileCheck size={20} />
                                    {notificationMessage}
                                </div>
                            )}

                            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-gray-800 to-black text-white p-5">
                                    <h1 className="text-3xl font-serif text-center flex items-center justify-center gap-3">
                                        <ShieldAlert className="h-7 w-7 text-red-500" />
                                        Editare bon de consum nr. {id_consum}
                                    </h1>
                                </div>

                                {isLoading ? (
                                    <div className="p-16 flex flex-col items-center justify-center text-gray-500">
                                        <Loader2 className="h-12 w-12 animate-spin mb-4" />
                                        <p className="text-xl">Se încarcă formularul...</p>
                                    </div>
                                ) : (
                                    <div className="p-6">
                                        {/* Formularul principal */}
                                        <div className="mb-6 grid grid-cols-4 gap-4 items-center">
                                            <label className="text-right font-serif text-lg">Gestiune:</label>
                                            <div className="col-span-3">
                                                <select
                                                    className="w-full p-2.5 border border-gray-300 bg-white rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"

                                                    value={gestiuneSelectata || ""}
                                                    onChange={(e) => setGestiuneSelectata(Number(e.target.value) || null)}
                                                >
                                                    <option value="">Selectează gestiunea</option>
                                                    {gestiuni.map(g => (
                                                        <option key={g.id_gestiune} value={g.id_gestiune}>{g.denumire}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <label className="text-right font-serif text-lg">Responsabil:</label>
                                            <div className="col-span-3">
                                                <select
                                                    className="w-full p-2.5 border border-gray-300 bg-white rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"

                                                    value={responsabilSelectat || ''}
                                                    onChange={(e) => setResponsabilSelectat(Number(e.target.value) || null)}
                                                >
                                                    <option value="">Selectează responsabilul</option>
                                                    {angajati.map(a => (
                                                        <option key={a.id_angajat} value={a.id_angajat}>
                                                            {a.nume_angajat} {a.prenume_angajat}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <label className="text-right font-serif text-lg">Data:</label>
                                            <div className="col-span-3 relative">
                                                <input
                                                    type="date"
                                                    className="w-full p-2.5 border border-gray-300 bg-white rounded-lg text-gray-800 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                    value={dataFormatataISO}
                                                    onChange={(e) => setDataConsum(e.target.value)}
                                                />
                                                <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                                                    <Calendar size={18} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-300 my-6"></div>

                                        {/* Cerere de aprovizionare existentă - dacă există */}
                                        {cerereExistenta && (
                                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3">
                                                <div className="bg-blue-500 p-2 rounded-full text-white flex-shrink-0">
                                                    <ShoppingCart size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-blue-700">Cerere de aprovizionare în așteptare</h3>
                                                    <p className="text-sm text-blue-600">
                                                        Există o cerere de aprovizionare în așteptare pentru această gestiune (ID: {cerereExistenta.id_cerere}).
                                                        Noile produse ce necesită aprovizionare vor fi adăugate la această cerere.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Secțiunea de bunuri utilizate */}
                                        <div className="mb-4">
                                            <h2 className="text-2xl font-serif mb-4">Bunuri utilizate</h2>

                                            <div className="flex justify-end mb-3">
                                                <button
                                                    onClick={deschideModal}
                                                    className="bg-white text-black border border-black hover:bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 transition-all shadow hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <Plus size={18} />
                                                    Adaugă bun de pe stoc
                                                </button>
                                            </div>

                                            <div className="bg-red-600 rounded-lg p-4 shadow-md">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full bg-white rounded-md overflow-hidden">
                                                        <thead>
                                                            <tr className="bg-gray-800 text-white">
                                                                <th className="p-3 text-left">Denumire bun</th>
                                                                <th className="p-3 text-center">Cant. necesară</th>
                                                                <th className="p-3 text-center">UM</th>
                                                                <th className="p-3 text-center">Cant. eliberată</th>
                                                                <th className="p-3 text-center">Preț unitar</th>
                                                                <th className="p-3 text-center">Valoare</th>
                                                                <th className="p-3 text-center">Acțiuni</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {liniiConsum.map((linie, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                                                    onMouseEnter={() => setHoveredRow(index)}
                                                                    onMouseLeave={() => setHoveredRow(null)}
                                                                >
                                                                    <td className="p-3 border-r">{linie.bun.nume_bun}</td>
                                                                    <td className="p-3 border-r text-center">{formatNumber(linie.cantitate_necesara)}</td>
                                                                    <td className="p-3 border-r text-center">{linie.bun.unitate_masura}</td>
                                                                    <td className="p-3 border-r text-center">{formatNumber(linie.cant_eliberata)}</td>
                                                                    <td className="p-3 border-r text-center">{formatNumber(linie.bun.pret_unitar)}</td>
                                                                    <td className="p-3 border-r text-center font-medium">{formatNumber(linie.valoare)}</td>
                                                                    <td className="p-3 flex justify-center gap-2">
                                                                        <button
                                                                            onClick={() => editLinie(index)}
                                                                            className="bg-cyan-500 p-1.5 rounded-full text-white hover:bg-cyan-600 transition-colors shadow"
                                                                            title="Editează"
                                                                        >
                                                                            <Edit size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => stergeLinie(index)}
                                                                            className="bg-red-500 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors shadow"
                                                                            title="Șterge"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {liniiConsum.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={7} className="p-6 text-center text-gray-500">
                                                                        <Package2 className="mx-auto mb-2" size={24} />
                                                                        <p>Nu există bunuri adăugate.</p>
                                                                        <p className="text-sm mt-1">Folosiți butonul "Adaugă bun de pe stoc" pentru a adăuga produse.</p>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                        {liniiConsum.length > 0 && (
                                                            <tfoot>
                                                                <tr className="bg-gray-100 border-t border-gray-300 font-medium">
                                                                    <td className="p-3">Total</td>
                                                                    <td className="p-3"></td>
                                                                    <td className="p-3"></td>
                                                                    <td className="p-3 text-center">{formatNumber(getCantitateaTotala())}</td>
                                                                    <td className="p-3"></td>
                                                                    <td className="p-3 text-center font-bold">{formatNumber(getValoareTotala())}</td>
                                                                    <td className="p-3"></td>
                                                                </tr>
                                                            </tfoot>
                                                        )}
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Butoanele de acțiune */}
                                        <div className="flex justify-between mt-8">
                                            <button
                                                onClick={renunta}
                                                className="bg-red-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors shadow hover:shadow-md"
                                                disabled={isSaving}
                                            >
                                                <X size={18} />
                                                Renunță
                                            </button>

                                            <button
                                                onClick={salveazaConsum}
                                                className="bg-black text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors shadow hover:shadow-md"
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={18} />
                                                        Salvare...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={18} />
                                                        Salvează
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modalul pentru adăugarea unui bun */}
                            {modalVisible && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 animate-modal-enter">
                                        <button
                                            onClick={inchideModal}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>

                                        <h2 className="text-2xl font-serif mb-6">Detalii bun de pe stoc</h2>

                                        <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                                            <label className="font-serif text-lg">Bun:</label>
                                            <div className="col-span-2">
                                                <select
                                                    className="w-full p-2.5 border border-gray-300 bg-white rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                    value={bunSelectat || ''}
                                                    onChange={(e) => setBunSelectat(Number(e.target.value) || null)}
                                                >
                                                    <option value="">Selectează bunul</option>
                                                    {bunuri.map(b => (
                                                        <option key={b.id_bun} value={b.id_bun}>{b.nume_bun}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {bunSelectat && (
                                            <>
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    <div className="bg-gray-800 text-white p-2 text-center">
                                                        Preț unitar
                                                    </div>
                                                    <div className="bg-gray-800 text-white p-2 text-center">
                                                        UM
                                                    </div>
                                                    <div className="bg-white p-2 text-center border border-gray-300">
                                                        {formatNumber(bunuri.find(b => b.id_bun === bunSelectat)?.pret_unitar)}
                                                    </div>
                                                    <div className="bg-white p-2 text-center border border-gray-300">
                                                        {bunuri.find(b => b.id_bun === bunSelectat)?.unitate_masura}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                                                    <label className="font-serif text-lg">Cantitate necesară:</label>
                                                    <div className="col-span-2">
                                                        <input
                                                            type="number"
                                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            value={cantitateNecesara}
                                                            onChange={(e) => setCantitateNecesara(e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>

                                                    <label className="font-serif text-lg">Cantitate eliberată:</label>
                                                    <div className="col-span-2">
                                                        <input
                                                            type="number"
                                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            value={cantitateEliberata}
                                                            onChange={(e) => setCantitateEliberata(e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="bg-gray-800 text-white p-2.5 text-center mb-6 rounded">
                                                    Valoare bun consumat: {formatNumber(valoareCalculata)}
                                                </div>
                                            </>
                                        )}

                                        <div className="flex justify-between mt-6">
                                            <button
                                                onClick={inchideModal}
                                                className="bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2"
                                            >
                                                <X size={18} />
                                                Renunță
                                            </button>

                                            <button
                                                onClick={adaugaBun}
                                                className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                disabled={!bunSelectat || !cantitateNecesara || !cantitateEliberata}
                                            >
                                                <Plus size={18} />
                                                Adaugă
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Alerta pentru cantitate insuficientă */}
                            {showAlertaInsuficienta && bunCuCantitateInsuficienta && (
                                <ConsumAlertaCantitateInsuficienta
                                    bun={bunCuCantitateInsuficienta}
                                    onConfirm={handleConfirmAlertaInsuficienta}
                                    onCancel={handleCancelAlertaInsuficienta}
                                />
                            )}

                            {/* Modal pentru cerere de aprovizionare */}
                            {showCerereAprovizionare && bunCuCantitateInsuficienta && (
                                <ModalCerereAprovizionare
                                    bunInitial={bunCuCantitateInsuficienta}
                                    idCerere={cerereExistenta?.id_cerere}
                                    onClose={() => {
                                        setShowCerereAprovizionare(false);
                                        setBunCuCantitateInsuficienta(null);
                                    }}
                                    onSave={handleSaveCerereAprovizionare}
                                />
                            )}

                            {/* Custom animations */}
                            <style jsx>{`
                @keyframes modalEnter {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                @keyframes fadeInSlide {
                    from { 
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-modal-enter {
                    animation: modalEnter 0.3s ease-out;
                }
                
                .animate-fade-in-slide {
                    animation: fadeInSlide 0.3s ease-out;
                }
            `}</style>
                        </div>
                    )
                }


            </div>
        </div>

    )
}

export default page