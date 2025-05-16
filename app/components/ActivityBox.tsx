import Link from 'next/link'
import React from 'react'
import { LinkClass } from '../models/LinkClass';


interface ActivityBoxProps {
    obj: LinkClass;
}

const ActivityBox: React.FC<ActivityBoxProps> = ({ obj }) => {

    return (
        <div className='flex flex-col justify-center items-center bg-[#333] text-white p-4 text-lg gap-5'>
            <h2>{String(obj.getName())}</h2>
            <div className="h-px w-full bg-gray-200 mt-2 mb-4"></div>
            <p>Nr. {obj.getTitle().toLowerCase()}: {obj.getNum().toString()}</p>
            <Link href={obj.getLink()} className='bg-white text-[#333] rounded-full p-3 hover:bg-red-400 transition ease-linear duration-300'>{obj.getTitle()}</Link>
        </div>
    )
}



export default ActivityBox