'use client';

import React, { useState } from 'react';

export type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface DateRangeSelectorProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    onCustomRangeChange?: (startDate: Date, endDate: Date) => void;
}

export default function DateRangeSelector({ value, onChange, onCustomRangeChange }: DateRangeSelectorProps) {
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const ranges: { value: DateRange; label: string }[] = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' },
        { value: 'year', label: 'This Year' },
        { value: 'custom', label: 'Custom' }
    ];

    const handleRangeChange = (range: DateRange) => {
        onChange(range);
        if (range === 'custom') {
            setShowCustomPicker(true);
        } else {
            setShowCustomPicker(false);
        }
    };

    const handleApplyCustomRange = () => {
        if (customStart && customEnd && onCustomRangeChange) {
            onCustomRangeChange(new Date(customStart), new Date(customEnd));
            setShowCustomPicker(false);
        }
    };

    return (
        <div className="relative">
            <div className="flex gap-2 flex-wrap">
                {ranges.map((range) => (
                    <button
                        key={range.value}
                        onClick={() => handleRangeChange(range.value)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${value === range.value
                                ? 'bg-gradient-to-r from-[#4B9DA9] to-[#91C6BC] text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }
                        `}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Custom Date Picker */}
            {showCustomPicker && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 animate-fade-in">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9DA9] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B9DA9] focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleApplyCustomRange}
                                disabled={!customStart || !customEnd}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#4B9DA9] to-[#91C6BC] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                            >
                                Apply
                            </button>
                            <button
                                onClick={() => setShowCustomPicker(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
