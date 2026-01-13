import React from 'react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    metrics: {
        submissions: number;
        placements: number;
        interviews: number;
    };
}

interface TeamPerformanceProps {
    members: TeamMember[];
    sortBy?: 'submissions' | 'placements' | 'interviews';
}

export default function TeamPerformance({ members, sortBy = 'placements' }: TeamPerformanceProps) {
    const sortedMembers = [...members].sort((a, b) => b.metrics[sortBy] - a.metrics[sortBy]);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    const getRankBadge = (index: number) => {
        if (index === 0) return { emoji: '🥇', color: 'bg-yellow-100 text-yellow-700' };
        if (index === 1) return { emoji: '🥈', color: 'bg-gray-100 text-gray-700' };
        if (index === 2) return { emoji: '🥉', color: 'bg-orange-100 text-orange-700' };
        return { emoji: `#${index + 1}`, color: 'bg-gray-50 text-gray-600' };
    };

    if (members.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">👥</div>
                    <p>No team members to display</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
                <div className="flex gap-2">
                    <select className="text-xs px-3 py-1 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                        <option value="placements">By Placements</option>
                        <option value="submissions">By Submissions</option>
                        <option value="interviews">By Interviews</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                {sortedMembers.map((member, index) => {
                    const badge = getRankBadge(index);
                    return (
                        <div
                            key={member.id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Rank Badge */}
                            <div className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center font-semibold text-sm flex-shrink-0`}>
                                {badge.emoji}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B9DA9] to-[#91C6BC] flex items-center justify-center text-white font-medium flex-shrink-0">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    getInitials(member.name)
                                )}
                            </div>

                            {/* Member Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{member.name}</p>
                                <p className="text-sm text-gray-600 truncate">{member.role}</p>
                            </div>

                            {/* Metrics */}
                            <div className="flex gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-bold text-[#4B9DA9]">{member.metrics.submissions}</div>
                                    <div className="text-xs text-gray-500">Submissions</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-[#E37434]">{member.metrics.interviews}</div>
                                    <div className="text-xs text-gray-500">Interviews</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-green-600">{member.metrics.placements}</div>
                                    <div className="text-xs text-gray-500">Placements</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
