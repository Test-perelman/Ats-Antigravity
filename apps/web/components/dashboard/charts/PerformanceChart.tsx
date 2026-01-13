'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
    data?: Array<{
        name: string;
        submissions: number;
        placements: number;
        interviews: number;
    }>;
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
    // Sample data if none provided
    const defaultData = [
        { name: 'Sarah J.', submissions: 45, placements: 8, interviews: 23 },
        { name: 'Mike C.', submissions: 38, placements: 6, interviews: 19 },
        { name: 'Emily D.', submissions: 52, placements: 10, interviews: 28 },
        { name: 'John S.', submissions: 31, placements: 5, interviews: 16 },
        { name: 'Lisa M.', submissions: 42, placements: 7, interviews: 21 }
    ];

    const chartData = data || defaultData;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-semibold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                    iconType="circle"
                />
                <Bar
                    dataKey="submissions"
                    fill="#4B9DA9"
                    radius={[8, 8, 0, 0]}
                    name="Submissions"
                />
                <Bar
                    dataKey="interviews"
                    fill="#E37434"
                    radius={[8, 8, 0, 0]}
                    name="Interviews"
                />
                <Bar
                    dataKey="placements"
                    fill="#10B981"
                    radius={[8, 8, 0, 0]}
                    name="Placements"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
