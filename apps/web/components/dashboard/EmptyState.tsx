import React from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {/* Icon */}
            <div className="text-6xl mb-4 opacity-50">
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 max-w-md">
                {description}
            </p>

            {/* Action Button */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-3 bg-gradient-to-r from-[#4B9DA9] to-[#91C6BC] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
