'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SubmissionsChartProps {
    data?: Array<{
        date: string;
        submitted: number;
        approved: number;
        rejected: number;
    }>;
    timeRange?: 'week' | 'month' | 'quarter';
}

export default function SubmissionsChart({ data, timeRange = 'month' }: SubmissionsChartProps) {
    // Sample data if none provided
    const defaultData = [
        { date: 'Jan 1', submitted: 12, approved: 8, rejected: 2 },
        { date: 'Jan 8', submitted: 19, approved: 14, rejected: 3 },
        { date: 'Jan 15', submitted: 15, approved: 11, rejected: 2 },
        { date: 'Jan 22', submitted: 22, approved: 16, rejected: 4 },
        { date: 'Jan 29', submitted: 18, approved: 13, rejected: 3 },
        { date: 'Feb 5', submitted: 25, approved: 19, rejected: 4 },
        { date: 'Feb 12', submitted: 21, approved: 15, rejected: 5 }
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
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="date"
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
                <Line
                    type="monotone"
                    dataKey="submitted"
                    stroke="#4B9DA9"
                    strokeWidth={2}
                    dot={{ fill: '#4B9DA9', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Submitted"
                />
                <Line
                    type="monotone"
                    dataKey="approved"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Approved"
                />
                <Line
                    type="monotone"
                    dataKey="rejected"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Rejected"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
