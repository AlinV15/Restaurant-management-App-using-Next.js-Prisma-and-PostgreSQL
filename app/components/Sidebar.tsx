
import { Circle } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

interface LinkItem {
    href: string;
    name: string;
    id: string;
}

type HoveredLinksState = {
    [key: string]: boolean;
};

const Sidebar: React.FC = () => {
    const [hoveredLinks, setHoveredLinks] = useState<HoveredLinksState>({
        comenzi: false,
        consum: false,
        receptii: false,
        altele: false
    });

    const handleMouseEnter = (linkName: string): void => {
        setHoveredLinks(prev => ({
            ...prev,
            [linkName]: true
        }));
    };

    const handleMouseLeave = (linkName: string): void => {
        setHoveredLinks(prev => ({
            ...prev,
            [linkName]: false
        }));
    };

    const links: LinkItem[] = [
        { href: '/comenzi', name: 'Comenzi', id: 'comenzi' },
        { href: '/consum', name: 'Consum', id: 'consum' },
        { href: '/receptii', name: 'Receptii', id: 'receptii' },
        { href: '/altele', name: 'Altele?', id: 'altele' },
    ];

    return (
        <div className='h-screen bg-white w-1/5 flex flex-col items-center border-r border-black fixed'>
            <h1 className='bg-red-600 p-7 m-5 text-center text-xl text-white w-full'>
                <Link href={"/"}>Aplicatie gestionare productie</Link>
            </h1>
            <nav className='flex flex-col gap-7 mt-14 text-black'>
                {links.map((link) => (
                    <Link
                        key={link.id}
                        href={link.href}
                        className={`flex items-center text-[20px] px-4 py-2 hover:font-semibold transition-colors duration-300 ${hoveredLinks[link.id] ? 'text-red-600' : ''}`}
                        onMouseEnter={() => handleMouseEnter(link.id)}
                        onMouseLeave={() => handleMouseLeave(link.id)}
                    >
                        <Circle
                            size={25}
                            fill='100'
                            color={hoveredLinks[link.id] ? '#991b1b' : '#D9D9D9'}
                            className={`mr-2 ${hoveredLinks[link.id] ? 'fill-red-800' : 'fill-[#D9D9D9]'} transition ease-in-out duration-400`}
                        />
                        {link.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
