import { Bun } from '@/lib/classes/Bun';
import { LinieConsum } from '@/lib/classes/LinieConsum';
import React, { useMemo, useState, useEffect } from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';


interface ConsumChartProps {
    liniiConsum: LinieConsum[];
}

const ConsumChart: React.FC<ConsumChartProps> = ({ liniiConsum }) => {
    const colorPalette = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#C9CBCF', '#7BC043', '#F37736', '#FFC857',
        '#41B3A3', '#E27D60', '#85DCBA', '#E8A87C', '#C38D9E',
        '#8D8741', '#659DBD', '#DAAD86', '#BC986A', '#FBEEC1'
    ];

    const [bun, setBun] = useState<Bun>();

    const processDataForChart = () => {
        const groupedData: Record<string, number> = {};

        liniiConsum.forEach((linie: LinieConsum) => {


            if (bun) {
                const numeBun = bun.nume_bun
                const cantitate = typeof linie.cant_eliberata === 'number'
                    ? linie.cant_eliberata
                    : Number(linie.cant_eliberata);

                if (groupedData[numeBun]) {
                    groupedData[numeBun] += cantitate;
                } else {
                    groupedData[numeBun] = cantitate;
                }
            }
        });

        return Object.keys(groupedData).map(key => ({
            name: key,
            cantitate: groupedData[key]
        }));
    };

    const chartData = processDataForChart();

    const bunColorMap = useMemo(() => {
        const colorMap: Record<string, string> = {};
        const uniqueBunNames = [...new Set(chartData.map(item => item.name))];
        const shuffledColors = [...colorPalette].sort(() => Math.random() - 0.5);

        uniqueBunNames.forEach((name, index) => {
            colorMap[name] = shuffledColors[index % shuffledColors.length];
        });

        return colorMap;
    }, [chartData]);

    const dataWithTrend = chartData.map((item, index, array) => {
        const start = Math.max(0, index - 2);
        const relevantItems = array.slice(start, index + 1);
        const sum = relevantItems.reduce((acc, curr) => acc + curr.cantitate, 0);

        return {
            ...item,
            trend: sum / relevantItems.length
        };
    });

    return (
        <div className="w-full" style={{ height: '400px' }}>
            <h2 className="text-center mb-4 text-black">Consum lunar de bunuri</h2>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={dataWithTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    className='text-black'
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={0}
                        tickMargin={10}
                    />
                    <YAxis
                        label={{
                            value: 'Cantitate consumată',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                        }}
                    />
                    <Tooltip
                        formatter={(value, name, entry) => {
                            if (name === 'Cantitate') {
                                const itemName = (entry as any).payload.name;
                                const bun = liniiConsum.find(l => l.getBun().nume_bun === itemName);
                                return [`${value} ${bun?.getBun().unitate_masura || ''}`, name];
                            }
                            return [value, name];
                        }}
                    />
                    <Legend />
                    <Bar dataKey="cantitate" name="Cantitate bun" color='black' className='text-black'>
                        {dataWithTrend.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={bunColorMap[entry.name]} color='black' />
                        ))}
                    </Bar>
                    <Line
                        type="monotone"
                        dataKey="trend"
                        name="Tendință consum"
                        stroke="#ff7300"
                        strokeWidth={2}
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ConsumChart;