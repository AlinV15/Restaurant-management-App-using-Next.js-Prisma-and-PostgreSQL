import Link from 'next/link'
import React from 'react'
import { Plus, ArrowUp, ArrowDown, FileText, User, Building, Calendar, DollarSign, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Consum } from '@/lib/classes/Consum'

interface ConsumTableProps {
    consum: Consum[]
}

// Define the valid sort fields based on Consum class property accessors
type SortField = 'getId' | 'getData' | 'getValoare';

interface ConsumTableState {
    sortField: SortField;
    sortDirection: 'asc' | 'desc';
    hoveredRow: number | null;
    activeDropdown: number | null;
    isDeleting: boolean;
    viewMode: boolean;
}

class ConsumTable extends React.Component<ConsumTableProps, ConsumTableState> {
    private router: any; // Router is normally a hook, but we'll pass it as a property

    constructor(props: ConsumTableProps) {
        super(props);
        this.state = {
            sortField: 'getId', // Use the getter method name instead of property name
            sortDirection: 'desc' as 'asc' | 'desc',
            hoveredRow: null,
            activeDropdown: null,
            isDeleting: false,
            viewMode: true
        };

        // Binding methods to this instance
        this.handleSort = this.handleSort.bind(this);
        this.viewConsum = this.viewConsum.bind(this);
        this.editConsum = this.editConsum.bind(this);
        this.deleteConsum = this.deleteConsum.bind(this);
        this.performDelete = this.performDelete.bind(this);
        this.sortData = this.sortData.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);
        this.getValueColor = this.getValueColor.bind(this);
    }

    // Method to set router from props
    setRouter(router: any) {
        this.router = router;
    }

    // Formatează data
    formatDate(dateInput: Date | string): string {
        // Verificăm dacă input-ul este deja un obiect Date
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

        // Verificăm dacă data rezultată este validă
        if (isNaN(date.getTime())) {
            return 'Data invalidă';
        }

        // Formatăm data
        return date.toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Formatează valoarea cu simbolul monedei
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2
        }).format(value);
    }

    // Sortează datele
    sortData(data: Consum[]): Consum[] {
        return [...data].sort((a, b) => {
            let compareValueA;
            let compareValueB;

            // Extragem valorile pentru comparație în funcție de câmpul de sortare
            switch (this.state.sortField) {
                case 'getData':
                    compareValueA = new Date(a.getData()).getTime();
                    compareValueB = new Date(b.getData()).getTime();
                    break;
                case 'getValoare':
                    compareValueA = a.getValoare();
                    compareValueB = b.getValoare();
                    break;
                case 'getId':
                default:
                    compareValueA = a.getId?.();
                    compareValueB = b.getId?.();
                    break;
            }

            // Sortăm în funcție de direcție
            if (this.state.sortDirection === 'asc') {
                return compareValueA > compareValueB ? 1 : -1;
            } else {
                return compareValueA < compareValueB ? 1 : -1;
            }
        });
    }

    // Funcție pentru schimbarea sortării
    handleSort(field: SortField) {
        if (field === this.state.sortField) {
            this.setState({
                sortDirection: this.state.sortDirection === 'asc' ? 'desc' : 'asc'
            });
        } else {
            this.setState({
                sortField: field,
                sortDirection: 'asc'
            });
        }
    }

    // Funcție pentru navigare către pagină
    goToPage(slug: number, isView: boolean) {
        this.router.push(`/consum/${slug}?view=${isView}`);
    }

    // Funcție pentru vizualizarea detaliată a consumului
    viewConsum(id: number) {
        this.setState({ viewMode: true }, () => {
            this.router.push(`/consum/${id}?view=${true}`);
        });
    }

    // Funcție pentru editarea consumului
    editConsum(id: number) {
        this.setState({ viewMode: false }, () => {
            this.router.push(`/consum/${id}?view=${false}`);
        });
    }

    // Funcție pentru ștergerea consumului
    deleteConsum(id: number) {
        // Afișăm un toast pentru confirmare
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <p className="font-medium">Confirmați ștergerea consumului #{id}?</p>
                    <p className="text-sm">Această acțiune este ireversibilă.</p>
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
                                this.performDelete(id);
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
    }

    // Implementarea efectivă a ștergerii
    async performDelete(id: number) {
        this.setState({ isDeleting: true });

        try {
            const toastId = toast.loading(`Se șterge consumul #${id}...`);

            // Aici ar veni apelul către API pentru ștergere
            const response = await fetch(`/api/consum/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Eroare la ștergerea consumului');
            }

            // Afișăm notificare de succes
            toast.success('Consumul a fost șters cu succes!', { id: toastId });

            // Alternativ - reîncărcați datele sau eliminați elementul din state local

        } catch (error) {
            console.error('Eroare la ștergerea consumului:', error);
            toast.error('A apărut o eroare la ștergerea consumului.');
        } finally {
            this.setState({
                isDeleting: false,
                activeDropdown: null
            });
        }
    }

    // Determinăm culoarea pentru valoare (verde pentru valori mici, galben pentru medii, roșu pentru mari)
    getValueColor(value: number): string {
        // Găsim valorile min și max
        const values = this.props.consum.map(c => c.getValoare?.());
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;

        // Calculăm procentul din interval
        const percent = range === 0 ? 0 : ((value - minValue) / range) * 100;

        if (percent < 33) return 'text-green-500';
        if (percent < 66) return 'text-amber-500';
        return 'text-red-500';
    }

    render() {
        // Sortăm datele
        const sortedData = this.sortData(this.props.consum);

        return (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-black p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <h3 className="text-lg font-medium">Tabel de consumuri</h3>
                    </div>
                    <div>
                        <Link
                            href="/consum/creare"
                            className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Adaugă consum nou
                        </Link>
                    </div>
                </div>

                {/* Tabel */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 text-sm">
                                <th
                                    className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() => this.handleSort('getId')}
                                >
                                    <div className="flex items-center gap-1">
                                        Număr
                                        {this.state.sortField === 'getId' && (
                                            this.state.sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() => this.handleSort('getData')}
                                >
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-500" />
                                        Data consum
                                        {this.state.sortField === 'getData' && (
                                            this.state.sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() => this.handleSort('getValoare')}
                                >
                                    <div className="flex items-center gap-1">
                                        <DollarSign size={14} className="text-gray-500" />
                                        Valoare
                                        {this.state.sortField === 'getValoare' && (
                                            this.state.sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left font-medium">
                                    <div className="flex items-center gap-1">
                                        <User size={14} className="text-gray-500" />
                                        Responsabil
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left font-medium">
                                    <div className="flex items-center gap-1">
                                        <Building size={14} className="text-gray-500" />
                                        Gestiune
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-center font-medium">
                                    Acțiuni
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedData.map((c, index) => (
                                <tr
                                    key={c.getId()}
                                    className={`hover:bg-blue-50 transition-colors ${this.state.hoveredRow === index ? 'bg-blue-50' : 'bg-white'}`}
                                    onMouseEnter={() => this.setState({ hoveredRow: index })}
                                    onMouseLeave={() => this.setState({ hoveredRow: null })}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium text-gray-900">#{c.getId()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-gray-700">{this.formatDate(c.getData())}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`font-bold ${this.getValueColor(c.getValoare())}`}>
                                            {this.formatCurrency(c.getValoare?.())}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
                                                {c.getSef?.().getNume?.().charAt(0)}{c.getSef?.().getPrenume?.().charAt(0)}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {`${c.getSef?.().getNume?.()} ${c.getSef?.().getPrenume?.()}`}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {c.getSef?.().getFunctie?.()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-sm font-medium bg-gray-100 rounded-md text-gray-800">
                                            {c.getGestiune?.().getDenumire?.()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end items-center space-x-2">
                                            {/* Buton vizualizare */}
                                            <button
                                                onClick={() => this.viewConsum(c.getId?.())}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-full transition-colors"
                                                title="Vizualizare"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            {/* Buton editare */}
                                            <button
                                                onClick={() => this.editConsum(c.getId?.())}
                                                className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-2 rounded-full transition-colors"
                                                title="Editare"
                                            >
                                                <Edit size={16} />
                                            </button>

                                            {/* Buton ștergere */}
                                            <button
                                                onClick={() => this.deleteConsum(c.getId?.())}
                                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-full transition-colors"
                                                title="Ștergere"
                                                disabled={this.state.isDeleting}
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            {/* Alternativ: dropdown cu acțiuni */}
                                            <div className="relative inline-block text-left">
                                                <button
                                                    className="p-2 rounded-full text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                                                    onClick={() => this.setState({
                                                        activeDropdown: this.state.activeDropdown === c.getId?.() ? null : c.getId?.()
                                                    })}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {this.state.activeDropdown === c.getId?.() && (
                                                    <div
                                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                                        onMouseLeave={() => this.setState({ activeDropdown: null })}
                                                    >
                                                        <div className="py-1" role="menu" aria-orientation="vertical">
                                                            <button
                                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                onClick={() => this.viewConsum(c.getId?.())}
                                                            >
                                                                <Eye size={16} className="mr-2" />
                                                                Vizualizare
                                                            </button>
                                                            <button
                                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                onClick={() => this.editConsum(c.getId?.())}
                                                            >
                                                                <Edit size={16} className="mr-2" />
                                                                Editare
                                                            </button>
                                                            <button
                                                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                                onClick={() => this.deleteConsum(c.getId?.())}
                                                                disabled={this.state.isDeleting}
                                                            >
                                                                <Trash2 size={16} className="mr-2" />
                                                                Ștergere
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sortedData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Nu există consumuri disponibile
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer cu paginare sau sumar */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                            Afișare <span className="font-medium">{sortedData.length}</span> consumuri
                        </span>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700 mr-2">
                                Valoare totală:
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {this.formatCurrency(sortedData.reduce((sum, c) => Number(sum) + Number(c.getValoare?.()), 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// Wrapper function to use hooks with class component
const ConsumTableWithRouter = (props: ConsumTableProps) => {
    const router = useRouter();
    const ref = React.useRef<ConsumTable>(null);

    React.useEffect(() => {
        if (ref.current) {
            ref.current.setRouter(router);
        }
    }, [router]);

    return <ConsumTable ref={ref} {...props} />;
};

export default ConsumTableWithRouter;