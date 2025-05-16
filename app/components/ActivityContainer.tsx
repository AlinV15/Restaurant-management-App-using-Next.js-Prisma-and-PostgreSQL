"use client"
import React, { useEffect, useState } from 'react'
import ActivityBox from './ActivityBox'
import { LinkClass } from '../models/LinkClass'
import { Consum } from '@/lib/classes/Consum'


const ActivityContainer = () => {
    //obiectele care folosesc stari
    const [consum, setConsum] = useState<Consum[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    //numerotari de documente pentru moment
    //let nrConsum = 0;
    let nrComenzi = 0;
    let nrReceptii = 0;
    let nrAltele = 0;

    // functiile de preluare a datelor
    const getCosum = async () => {
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/api/consum");

            if (!res) {
                console.log("Este o eroare in preluarea datelor!")
                setError(true);
                return;
            }
            const data = await res.json();

            console.log(data);
            setConsum(data);


        } catch (error) {
            console.log("Eroarea este: " + error)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    //efectele de preluare propriu-zisa

    useEffect(() => {
        getCosum();

    }, [])


    const objArray = [
        {
            key: 1,
            name: "Consum",
            num: consum.length,
            link: "/consum",
            linkTitle: "Bonuri de consum"
        },
        {
            key: 2,
            name: "Comenzi",
            num: nrComenzi,
            link: "/comenzi",
            linkTitle: "Comenzi"
        },
        {
            key: 3,
            name: "Receptii",
            num: nrReceptii,
            link: "/receptii",
            linkTitle: "Bonuri receptie"
        },
        {
            key: 4,
            name: "Retete",
            num: nrAltele,
            link: "/altele",
            linkTitle: "Retete"
        }
    ]

    const linksArray = objArray.map(obj => new LinkClass().parse(obj))

    console.log(linksArray)
    return (
        <div className='grid grid-cols-2 gap-10 p-4'>
            {
                consum ?
                    linksArray.map((obj: LinkClass) => {
                        return (
                            <ActivityBox obj={obj} key={obj.getKey()} />
                        )
                    }) : ""
            }
        </div>
    )
}

export default ActivityContainer