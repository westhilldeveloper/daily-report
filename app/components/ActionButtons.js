'use client';

import {
    FileSpreadsheet,
    FileText,
    Trash2,
    Loader2,
    Database
} from 'lucide-react';

export default function ActionButtons({
    onExport,
    onDelete,
    count,
    exportingExcel,
    exportingPDF,
    isLoggedIn,          // ← new prop
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-wrap items-center gap-3">
                {/* Row count badge */}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <Database className="w-4 h-4" />
                    <span>{count} row{count !== 1 ? 's' : ''} available</span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 ml-auto">
                    {/* Export Excel */}
                    <button
                        onClick={() => onExport('excel')}
                        disabled={!count || exportingExcel}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exportingExcel ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="w-4 h-4" />
                        )}
                        {exportingExcel ? 'Exporting...' : 'Export Excel'}
                    </button>

                    {/* Export PDF */}
                    <button
                        onClick={() => onExport('pdf')}
                        disabled={!count || exportingPDF}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exportingPDF ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        {exportingPDF ? 'Exporting...' : 'Export PDF'}
                    </button>

                    {/* Delete Range – visible only when logged in */}
                    {isLoggedIn && (
                        <button
                            onClick={onDelete}
                            disabled={!count || exportingExcel || exportingPDF}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Range
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}