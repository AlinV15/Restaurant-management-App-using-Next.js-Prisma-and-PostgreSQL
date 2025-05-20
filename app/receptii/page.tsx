"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../components/Sidebar"
import LoadingSpinner from "../components/LoadingSpinner"
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import toast from "react-hot-toast"

export default function ReceptiiPage() {
  const router = useRouter()
  const [receptii, setReceptii] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<string>("nr_document")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)

  // Fetch receptions
  useEffect(() => {
    const fetchReceptii = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/receptie")
        if (!response.ok) throw new Error("Failed to fetch receptions")

        const data = await response.json()
        setReceptii(data)
      } catch (error) {
        console.error("Error fetching receptions:", error)
        toast.error("Eroare la încărcarea recepțiilor")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReceptii()
  }, [])

  // Toggle sort
  const toggleSort = (field: string) => {
    setSortField(field)
    setSortDirection(sortField === field && sortDirection === "asc" ? "desc" : "asc")
  }

  // Format date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("ro-RO")
  }

  // Sort receptions
  const sortedReceptii = [...receptii].sort((a, b) => {
    if (sortField === "data") {
      const dateA = a.data ? new Date(a.data).getTime() : 0
      const dateB = b.data ? new Date(b.data).getTime() : 0
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    }

    // Handle undefined values for other fields
    const valueA = a[sortField] ?? 0
    const valueB = b[sortField] ?? 0

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA
    }

    // Convert to string for comparison if not numbers
    const strA = String(valueA)
    const strB = String(valueB)
    return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA)
  })

  if (isLoading) {
    return (
      <div className="flex">
        <div className="w-1/5">
          <Sidebar />
        </div>
        <div className="w-4/5 flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <div className="w-1/5">
        <Sidebar />
      </div>
      <div className="w-4/5 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Recepții</h1>
          <button
            onClick={() => router.push("/receptie")}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Adaugă recepție
          </button>
        </div>

        <div className="bg-white shadow rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("nr_document")}
                >
                  Nr. Recepție
                  {sortField === "nr_document" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("data")}
                >
                  Data
                  {sortField === "data" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("valoare_totala")}
                >
                  Valoare Totală
                  {sortField === "valoare_totala" && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedReceptii.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nu există recepții. Folosiți butonul "Adaugă recepție" pentru a adăuga.
                  </td>
                </tr>
              ) : (
                sortedReceptii.map((receptie) => (
                  <tr key={receptie.nr_document} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{receptie.nr_document}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(receptie.data)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{Number(receptie.valoare_totala).toFixed(2)} RON</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {receptie.validat ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Validată
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Nevalidată
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === receptie.nr_document ? null : receptie.nr_document)
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {activeDropdown === receptie.nr_document && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                          <div className="py-1">
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              onClick={() => router.push(`/receptie/${receptie.nr_document}`)}
                            >
                              <Eye size={16} className="mr-2" /> Vizualizează
                            </button>
                            {!receptie.validat && (
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                onClick={() => router.push(`/receptie/${receptie.nr_document}/edit`)}
                              >
                                <Edit size={16} className="mr-2" /> Editează
                              </button>
                            )}
                            {!receptie.validat && (
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                onClick={() => {
                                  // Handle delete
                                  toast.error("Funcționalitate neimplementată")
                                }}
                              >
                                <Trash2 size={16} className="mr-2" /> Șterge
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
