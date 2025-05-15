"use client";

import React, { useEffect, useState } from "react";
import ActivityBox, { ActivityItem } from "./ActivityBox";
import { Consum } from "@/lib/classes/Consum";

const ActivityContainer = () => {
    const [consumuri, setConsumuri] = useState<Consum[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchConsumuri = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/consum");
            if (!res.ok) throw new Error("Eroare la fetch consumuri");

            const data = await res.json();
            setConsumuri(data.map((c: any) => Consum.fromApi(c)));
        } catch (e) {
            console.error("Eroare:", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsumuri();
    }, []);

    const items: ActivityItem[] = [
        new ActivityItem(1, "Consum", consumuri.length, "/consum", "Bonuri de consum"),
        new ActivityItem(2, "Comenzi", 0, "/comenzi", "Comenzi"),
        new ActivityItem(3, "Receptii", 0, "/receptii", "Bonuri receptie"),
        new ActivityItem(4, "Retete", 0, "/altele", "Retete")
    ];

    return (
        <div className="grid grid-cols-2 gap-10 p-4">
            {items.map((item) => (
                <ActivityBox item={item} key={item.id} />
            ))}
        </div>
    );
};

export default ActivityContainer;
