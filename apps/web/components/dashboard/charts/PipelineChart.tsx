'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PipelineChartProps {
    data?: Array<{
        stage: string;
        count: number;
        percentage?: number;
    }>;
}

export default function PipelineChart({ data }: PipelineChartProps) {
    // Sample data if none provided
    const defaultData = [
        { stage: 'Applied', count: 150, percentage: 100 },
        { stage: 'Screening', count: 89, percentage: 59 },
        { stage: 'Interview', count: 45, percentage: 30 },
        { stage: 'Offer', count: 18, percentage: 12 },
        { stage: 'Hired', count: 12, percentage: 8 }
    ];

    const chartData = data || defaultData;

    // Color gradient for funnel stages
    const colors = ['#4B9DA9', '#5EADB7', '#71BDC5', '#84CDD3', '#91C6BC'];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-medium text-gray-900 mb-1">{data.stage}</p>
                    <p className="text-sm text-gray-600">
                        Count: <span className="font-semibold">{data.count}</span>
                    </p>
                    {data.percentage && (
                        <p className="text-sm text-gray-600">
                            Conversion: <span className="font-semibold">{data.percentage}%</span>
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    layout="vertical"
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <YAxis
                        type="category"
                        dataKey="stage"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Conversion Rates */}
            <div className="grid grid-cols-5 gap-2 mt-4">
                {chartData.map((stage, index) => (
                    <div key={stage.stage} className="text-center">
                        <div className="text-xs text-gray-600 mb-1">{stage.stage}</div>
                        <div className="text-lg font-bold" style={{ color: colors[index] }}>
                            {stage.count}
                        </div>
                        {stage.percentage && (
                            <div className="text-xs text-gray-500">{stage.percentage}%</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
