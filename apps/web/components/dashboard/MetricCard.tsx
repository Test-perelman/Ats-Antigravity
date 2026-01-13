import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    onClick?: () => void;
    variant?: 'primary' | 'accent' | 'success' | 'warning';
}

export default function MetricCard({
    title,
    value,
    icon,
    trend,
    onClick,
    variant = 'primary'
}: MetricCardProps) {
    const variantStyles = {
        primary: 'from-[#4B9DA9] to-[#91C6BC]',
        accent: 'from-[#E37434] to-[#F6F3C2]',
        success: 'from-green-500 to-green-400',
        warning: 'from-yellow-500 to-yellow-400'
    };

    return (
        <div
            onClick={onClick}
            className={`
        relative overflow-hidden rounded-xl p-6 
        bg-white shadow-md hover:shadow-lg
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        animate-fade-in
      `}
        >
            {/* Gradient Accent Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${variantStyles[variant]}`} />

            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>

                    {trend && (
                        <div className="flex items-center mt-2 text-sm">
                            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-gray-500 ml-1">vs last month</span>
                        </div>
                    )}
                </div>

                {icon && (
                    <div className={`
            p-3 rounded-lg bg-gradient-to-br ${variantStyles[variant]}
            text-white
          `}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
