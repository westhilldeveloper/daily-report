'use client';

import { useState, useMemo } from 'react';
import { formatNumber } from '@/app/lib/dateFormatter';

export default function DataTable({ rows, headers, dateCol, loading }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showOnlyPaid, setShowOnlyPaid] = useState(false);

    // ── Column width mapping ────────────────────────────────────────
    const getColumnWidthClass = (header) => {
    const lower = header.toLowerCase();
    if (lower.includes('chit no.')) return 'min-w-[190px]';
    if (lower.includes('subscriber name')) return 'min-w-[220px]';
    if (lower.includes('branch')) return 'min-w-[110px]';
    if (lower.includes('chit value') || lower.includes('subscription due') || 
        lower.includes('total due') || lower.includes('amt pd') ||           
        lower.includes('pending cheque amount') ||
        lower.includes('current installment amount')) return 'min-w-[120px]';
    if (lower.includes('status')) return 'min-w-[80px]';
    if (lower.includes('date') || lower.includes('time')) return 'min-w-[110px]';
    return 'min-w-[100px]';
};
    const excludedColumns = ['Subscriber MobileNo.'];
    // ── Define column order ────────────────────────────────────────
    // ── Define column order ────────────────────────────────────────
const desiredOrder = [
    'Branch',
    'Chit No.',
    'Chit Value',
    'Subscriber Name',
    'Auction Date',
    'Next Auction Date',
    'Next Auction Time',
    'Due Date',
    'Due Months',
    'Subscription Due',
    'Discount',
    'Total Due',
    'Amt Pd',                         
    'Pending Cheque Amount',
    'Current Installment No.',
    'Current Installment Amount',
    'Status',
    'Enroll Date',
    'Incharge Name',
    'Agent Name',
    'Subscriber Area'
];

    // ── Date formatter ─────────────────────────────────────────────
    const formatDate = (value) => {
        if (!value) return '';
        if (typeof value === 'number') {
            const excelEpoch = new Date((value - 25569) * 86400 * 1000);
            return excelEpoch.toLocaleDateString('en-GB');
        }
        if (typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-GB');
            }
        }
        if (value instanceof Date) {
            return value.toLocaleDateString('en-GB');
        }
        return value;
    };

    const dateColumns = [
        'Auction Date',
        'Next Auction Date',
        'Due Date',
        'Enroll Date'
    ];

    // ── Reorder headers ──────────────────────────────────────────────
    const orderedHeaders = useMemo(() => {
        if (!headers.length) return [];

        const headerMap = {};
        headers.forEach(h => {
            headerMap[h.toLowerCase().trim()] = h;
        });

        const ordered = [];
        const used = new Set();

        desiredOrder.forEach(desired => {
            const lowerDesired = desired.toLowerCase().trim();
            const matchedKey = Object.keys(headerMap).find(key => key === lowerDesired);
            if (matchedKey) {
                const original = headerMap[matchedKey];
               if (!excludedColumns.includes(original)) {
                ordered.push(original);
                used.add(original);
            }
            }
        });

        headers.forEach(h => {
        if (!used.has(h) && !excludedColumns.includes(h)) {
            ordered.push(h);
        }
    });

        return ordered;
    }, [headers]);

    // ── Find special columns ──────────────────────────────────────
    const dueMonthsCol = useMemo(() => {
        return headers.find(h => h.toLowerCase().includes('due months')) || null;
    }, [headers]);

    const subscriberNameCol = useMemo(() => {
        return headers.find(h => h.toLowerCase().includes('subscriber name')) || null;
    }, [headers]);

    const effectiveDateCol = dateCol || headers.find(h => /date/i.test(h)) || null;

    // ── Filter & sort ─────────────────────────────────────────────
    const processedRows = useMemo(() => {
        let result = [...rows];

        if (searchTerm && subscriberNameCol) {
            result = result.filter(row => {
                const name = row.data[subscriberNameCol] || '';
                return name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        if (dueMonthsCol) {
            result.sort((a, b) => {
                const valA = parseFloat(a.data[dueMonthsCol]) || 0;
                const valB = parseFloat(b.data[dueMonthsCol]) || 0;
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            });
        }

        return result;
    }, [rows, searchTerm, sortOrder, subscriberNameCol, dueMonthsCol]);

    // ── Render ──────────────────────────────────────────────────────
    if (!rows.length && !loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Select a date range and click "Show Data" to view reports.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-gray-50/70 border-b border-gray-100">
                {subscriberNameCol && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-600">Search by Name:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Type a name..."
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-sm text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
                {dueMonthsCol && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm font-medium text-gray-600">Sort by Due Months:</span>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1 transition-colors"
                        >
                            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/80">
                        <tr>
                            {orderedHeaders.map(h => (
                                <th
                                    key={h}
                                    className={`px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${getColumnWidthClass(h)}`}
                                >
                                    {h === effectiveDateCol ? '📅 ' + h : h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={orderedHeaders.length} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : processedRows.length === 0 ? (
                            <tr><td colSpan={orderedHeaders.length} className="px-4 py-8 text-center text-gray-400">
                                {searchTerm ? 'No matching subscriber names found.' : 'No data for this range.'}
                            </td></tr>
                        ) : (
                            processedRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors duration-150">
                                    {orderedHeaders.map(h => (
                                        <td
                                            key={h}
                                            className={`px-4 py-2.5 text-sm text-gray-700 ${getColumnWidthClass(h)}`}
                                        >
                                            {dateColumns.includes(h)
                                                ? formatDate(row.data[h])
                                                : h === effectiveDateCol
                                                    ? formatDate(row.date)
                                                    : (row.data[h] ?? '')
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer with row count */}
            <div className="px-5 py-3 text-sm text-gray-400 border-t border-gray-100 bg-gray-50/50">
                Showing {processedRows.length} of {rows.length} rows
            </div>
        </div>
    );
}