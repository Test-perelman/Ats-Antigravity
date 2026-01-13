import React from 'react';

interface Interview {
    id: string;
    candidateName: string;
    jobTitle: string;
    scheduledAt: string;
    interviewType: 'phone' | 'video' | 'onsite';
    meetingLink?: string;
}

interface UpcomingInterviewsProps {
    interviews: Interview[];
    maxItems?: number;
}

export default function UpcomingInterviews({ interviews, maxItems = 5 }: UpcomingInterviewsProps) {
    const displayInterviews = interviews.slice(0, maxItems);

    const getTimeUntil = (scheduledAt: string) => {
        const date = new Date(scheduledAt);
        const now = new Date();
        const hours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (hours < 0) return 'Past';
        if (hours < 1) return 'Soon';
        if (hours < 24) return `In ${hours}h`;
        const days = Math.floor(hours / 24);
        return `In ${days}d`;
    };

    const formatDateTime = (scheduledAt: string) => {
        const date = new Date(scheduledAt);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getInterviewIcon = (type: Interview['interviewType']) => {
        const icons = {
            phone: '📞',
            video: '🎥',
            onsite: '🏢'
        };
        return icons[type];
    };

    if (displayInterviews.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📅</div>
                    <p>No upcoming interviews scheduled</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
                <span className="text-sm text-gray-500">{interviews.length} total</span>
            </div>

            <div className="space-y-3">
                {displayInterviews.map((interview, index) => (
                    <div
                        key={interview.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F6F3C2]/30 to-transparent rounded-lg hover:shadow-md transition-all animate-fade-in border border-gray-100"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start gap-3 flex-1">
                            {/* Interview Type Icon */}
                            <div className="text-2xl mt-1">
                                {getInterviewIcon(interview.interviewType)}
                            </div>

                            {/* Interview Details */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {interview.candidateName}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                    {interview.jobTitle}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(interview.scheduledAt)}
                                </p>
                            </div>
                        </div>

                        {/* Time Badge & Actions */}
                        <div className="flex items-center gap-3 ml-4">
                            <span className="px-3 py-1 bg-[#4B9DA9] text-white rounded-full text-xs font-medium whitespace-nowrap">
                                {getTimeUntil(interview.scheduledAt)}
                            </span>

                            <div className="flex gap-2">
                                {interview.meetingLink && (
                                    <a
                                        href={interview.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#4B9DA9] hover:text-[#E37434] font-medium text-sm transition-colors"
                                    >
                                        Join
                                    </a>
                                )}
                                <button className="text-[#4B9DA9] hover:text-[#E37434] font-medium text-sm transition-colors">
                                    View →
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {interviews.length > maxItems && (
                <button className="w-full mt-4 text-sm text-[#4B9DA9] hover:text-[#E37434] font-medium transition-colors">
                    View all {interviews.length} interviews →
                </button>
            )}
        </div>
    );
}
