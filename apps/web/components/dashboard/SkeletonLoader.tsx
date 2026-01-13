import React from 'react';

interface SkeletonLoaderProps {
    type?: 'metric' | 'chart' | 'list' | 'table';
    count?: number;
}

export default function SkeletonLoader({ type = 'metric', count = 1 }: SkeletonLoaderProps) {
    const MetricSkeleton = () => (
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4" />
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-8 bg-gray-300 rounded w-16 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            </div>
        </div>
    );

    const ChartSkeleton = () => (
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-64 bg-gray-100 rounded flex items-end justify-around p-4 gap-2">
                {[60, 40, 75, 55, 90, 45, 80].map((height, i) => (
                    <div
                        key={i}
                        className="bg-gray-200 rounded-t w-full"
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div>
        </div>
    );

    const ListSkeleton = () => (
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const TableSkeleton = () => (
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-300 rounded" />
                    ))}
                </div>
                {/* Rows */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                        {[...Array(4)].map((_, j) => (
                            <div key={j} className="h-4 bg-gray-200 rounded" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

    const skeletonTypes = {
        metric: MetricSkeleton,
        chart: ChartSkeleton,
        list: ListSkeleton,
        table: TableSkeleton
    };

    const SkeletonComponent = skeletonTypes[type];

    return (
        <>
            {[...Array(count)].map((_, i) => (
                <SkeletonComponent key={i} />
            ))}
        </>
    );
}
