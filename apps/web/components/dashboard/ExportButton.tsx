'use client';

import React, { useState } from 'react';

interface ExportButtonProps {
    onExport: (format: 'csv' | 'pdf') => void;
    loading?: boolean;
}

export default function ExportButton({ onExport, loading = false }: ExportButtonProps) {
    const [showMenu, setShowMenu] = useState(false);

    const handleExport = (format: 'csv' | 'pdf') => {
        onExport(format);
        setShowMenu(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#4B9DA9] rounded-full animate-spin" />
                        <span>Exporting...</span>
                    </>
                ) : (
                    <>
                        <span>📥</span>
                        <span>Export</span>
                    </>
                )}
            </button>

            {showMenu && !loading && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px] animate-fade-in">
                    <button
                        onClick={() => handleExport('csv')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <span>📊</span>
                        <span>Export as CSV</span>
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <span>📄</span>
                        <span>Export as PDF</span>
                    </button>
                </div>
            )}

            {/* Backdrop to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    );
}
