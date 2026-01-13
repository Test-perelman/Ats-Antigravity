import React from 'react';

interface Activity {
    id: string;
    type: 'user' | 'team' | 'candidate' | 'job' | 'submission';
    action: string;
    user: string;
    timestamp: string;
}

interface ActivityFeedProps {
    activities: Activity[];
    maxItems?: number;
}

export default function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
    const displayActivities = activities.slice(0, maxItems);

    const getIcon = (type: Activity['type']) => {
        const icons = {
            user: '👤',
            team: '👥',
            candidate: '🎯',
            job: '💼',
            submission: '📝'
        };
        return icons[type] || '📌';
    };

    const getTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

            <div className="space-y-4">
                {displayActivities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#4B9DA9] to-[#91C6BC] flex items-center justify-center text-white text-lg">
                            {getIcon(activity.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                                <span className="font-medium">{activity.user}</span>
                                {' '}
                                <span className="text-gray-600">{activity.action}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {getTimeAgo(activity.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {activities.length > maxItems && (
                <button className="w-full mt-4 text-sm text-[#4B9DA9] hover:text-[#E37434] font-medium transition-colors">
                    View all activity →
                </button>
            )}
        </div>
    );
}
