import React from 'react';

interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    loading?: boolean;
}

export default function ChartCard({
    title,
    subtitle,
    children,
    actions,
    loading = false
}: ChartCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {/* Chart Content */}
            <div className="relative">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-pulse text-[#4B9DA9]">Loading chart...</div>
                    </div>
                ) : (
                    <div className="w-full">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
