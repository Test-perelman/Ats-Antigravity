import React from 'react';
import Link from 'next/link';

interface QuickAction {
    id: string;
    label: string;
    icon: string;
    href: string;
    color?: 'primary' | 'accent';
}

interface QuickActionsProps {
    actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {actions.map((action, index) => (
                    <Link
                        key={action.id}
                        href={action.href}
                        className={`
              group relative overflow-hidden
              flex flex-col items-center justify-center
              p-6 rounded-lg
              bg-gradient-to-br ${action.color === 'accent'
                                ? 'from-[#E37434] to-[#F6F3C2]'
                                : 'from-[#4B9DA9] to-[#91C6BC]'
                            }
              text-white
              hover:shadow-lg hover:scale-105
              transition-all duration-300
              animate-fade-in
            `}
                        style={{ animationDelay: `${index * 75}ms` }}
                    >
                        <div className="text-4xl mb-2">{action.icon}</div>
                        <span className="text-sm font-medium text-center">{action.label}</span>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
