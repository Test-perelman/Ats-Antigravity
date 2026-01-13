import React from 'react';

interface Submission {
    id: string;
    candidateName: string;
    jobTitle: string;
    status: 'pending' | 'approved' | 'rejected' | 'interviewing';
    submittedAt: string;
    submittedBy: string;
}

interface RecentSubmissionsProps {
    submissions: Submission[];
    maxItems?: number;
}

export default function RecentSubmissions({ submissions, maxItems = 5 }: RecentSubmissionsProps) {
    const displaySubmissions = submissions.slice(0, maxItems);

    const getStatusColor = (status: Submission['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            interviewing: 'bg-blue-100 text-blue-700'
        };
        return colors[status];
    };

    const getStatusIcon = (status: Submission['status']) => {
        const icons = {
            pending: '⏳',
            approved: '✅',
            rejected: '❌',
            interviewing: '🎯'
        };
        return icons[status];
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

    if (displaySubmissions.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p>No recent submissions</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
                <div className="flex gap-2">
                    <button className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        All
                    </button>
                    <button className="text-xs px-3 py-1 rounded-full hover:bg-gray-100 transition-colors">
                        Pending
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {displaySubmissions.map((submission, index) => (
                    <div
                        key={submission.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all animate-fade-in border border-gray-100"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Status Icon */}
                            <div className="text-xl mt-0.5">
                                {getStatusIcon(submission.status)}
                            </div>

                            {/* Submission Details */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {submission.candidateName}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                    {submission.jobTitle}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    by {submission.submittedBy} • {getTimeAgo(submission.submittedAt)}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge & Action */}
                        <div className="flex items-center gap-3 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(submission.status)}`}>
                                {submission.status}
                            </span>
                            <button className="text-[#4B9DA9] hover:text-[#E37434] font-medium text-sm transition-colors whitespace-nowrap">
                                Review →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {submissions.length > maxItems && (
                <button className="w-full mt-4 text-sm text-[#4B9DA9] hover:text-[#E37434] font-medium transition-colors">
                    View all {submissions.length} submissions →
                </button>
            )}
        </div>
    );
}
