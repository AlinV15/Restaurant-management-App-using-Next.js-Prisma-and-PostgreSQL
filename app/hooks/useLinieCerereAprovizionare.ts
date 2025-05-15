import { LinieCerereAprovizionare } from "@/lib/classes/LinieCerereAprovizionare";
import toast from "react-hot-toast";

export function useLinieCerereAprovizionare() {
    const createLinie = async (data: any) => {
        try {
            const res = await fetch("/api/linie-cerere-aprovizionare", {
                method: "POST",
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Eroare la creare linie");
            const linie = await res.json();
            return LinieCerereAprovizionare.fromPrisma(linie);
        } catch (err) {
            toast.error("Eroare la creare linie");
            throw err;
        }
    };

    const updateLinie = async (id: number, data: any) => {
        try {
            const res = await fetch(`/api/linie-cerere-aprovizionare/${id}`, {
                method: "PUT",
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Eroare la actualizare linie");
            const linie = await res.json();
            return LinieCerereAprovizionare.fromPrisma(linie);
        } catch (err) {
            toast.error("Eroare la actualizare linie");
            throw err;
        }
    };

    const deleteLinie = async (id: number) => {
        try {
            const res = await fetch(`/api/linie-cerere-aprovizionare/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Eroare la ștergere linie");
        } catch (err) {
            toast.error("Eroare la ștergere linie");
            throw err;
        }
    };

    return {
        createLinie,
        updateLinie,
        deleteLinie
    };
}
