// ActivityBox.tsx
import Link from "next/link";
import React from "react";

export class ActivityItem {
    constructor(
        public id: number,
        public name: string,
        public count: number,
        public link: string,
        public linkTitle: string
    ) { }

    static fromRaw(obj: any): ActivityItem {
        return new ActivityItem(
            obj.key || obj.id,
            obj.name,
            obj.num || obj.count,
            obj.link,
            obj.linkTitle
        );
    }
}

interface Props {
    item: ActivityItem;
}

const ActivityBox: React.FC<Props> = ({ item }) => {
    return (
        <div className="flex flex-col justify-center items-center bg-zinc-800 text-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-bold">{item.name}</h2>
            <div className="h-px w-full bg-gray-500 my-3" />
            <p className="text-base mb-2">Nr. {item.linkTitle.toLowerCase()}: <span className="font-semibold">{item.count}</span></p>
            <Link href={item.link}>
                <span className="inline-block bg-white text-zinc-800 rounded-full px-4 py-2 hover:bg-red-400 hover:text-white transition duration-300 cursor-pointer">
                    {item.linkTitle}
                </span>
            </Link>
        </div>
    );
};

export default ActivityBox;
