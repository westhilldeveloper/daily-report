'use client';

import { useState, useMemo } from 'react';
import { formatNumber } from '@/app/lib/dateFormatter';

// ─── Helper: find the "Amt Pd" or "Amt Paid" column ──────────────
function findAmtColumn(keys) {
    const lowerKeys = keys.map(k => k.trim().toLowerCase());
    const exactMatches = ['amt pd', 'amt pd.', 'amt paid', 'amt paid.', 'amtpd', 'amount paid', 'paid amount'];
    for (const match of exactMatches) {
        const idx = lowerKeys.indexOf(match);
        if (idx !== -1) return keys[idx];
    }
    // Fallback: contains both "amt" and "pd" or "paid"
    for (const key of keys) {
        const lower = key.toLowerCase();
        if ((lower.includes('amt') && (lower.includes('pd') || lower.includes('paid'))) ||
            lower.includes('amount paid') || lower.includes('paid amount')) {
            return key;
        }
    }
    return null;
}

export default function DataTable({ rows, headers, dateCol, loading }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showOnlyPaid, setShowOnlyPaid] = useState(false);

    // ── Column width mapping ──────────────────────────────────────
    const getColumnWidthClass = (header) => {
        const lower = header.toLowerCase();
        if (lower.includes('chit no.')) return 'min-w-[160px]';
        if (lower.includes('subscriber name')) return 'min-w-[180px]';
        if (lower.includes('branch')) return 'min-w-[90px]';
        if (lower.includes('chit value') || lower.includes('subscription due') || 
            lower.includes('total due') || lower.includes('amt pd') || lower.includes('amt paid') ||         
            lower.includes('pending cheque amount') ||
            lower.includes('current installment amount')) return 'min-w-[100px]';
        if (lower.includes('status')) return 'min-w-[70px]';
        if (lower.includes('date') || lower.includes('time')) return 'min-w-[95px]';
        return 'min-w-[80px]';
    };

    const excludedColumns = ['Subscriber MobileNo.'];

    // ─── Detect the actual "Amt" column ──────────────────────────
    const amtColumn = findAmtColumn(headers);

    // ─── Define desired order (with placeholder for Amt) ──────────
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
        'Amt Placeholder',     // will be replaced with actual column name
        'Pending Cheque Amount',
        'Current Installment No.',
        'Current Installment Amount',
        'Status',
        'Enroll Date',
        'Incharge Name',
        'Agent Name',
        'Subscriber Area'
    ];

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
            // Replace placeholder with actual column if found
            let target = desired;
            if (desired === 'Amt Placeholder') {
                target = amtColumn || 'Amt Pd'; // fallback if not found
            }
            const lowerDesired = target.toLowerCase().trim();
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
    }, [headers, amtColumn]);

    const dueMonthsCol = useMemo(() => {
        return headers.find(h => h.toLowerCase().includes('due months')) || null;
    }, [headers]);

    const subscriberNameCol = useMemo(() => {
        return headers.find(h => h.toLowerCase().includes('subscriber name')) || null;
    }, [headers]);

    const effectiveDateCol = dateCol || headers.find(h => /date/i.test(h)) || null;

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

    if (!rows.length && !loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Select a date range and click "Show Data" to view reports.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-gray-50/70 border-b border-gray-100">
                {subscriberNameCol && (
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600">Search:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Type a name..."
                            className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
                {dueMonthsCol && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs font-medium text-gray-600">Sort Due Months:</span>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1 transition-colors"
                        >
                            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/80">
                        <tr>
                            {orderedHeaders.map(h => (
                                <th
                                    key={h}
                                    className={`px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider ${getColumnWidthClass(h)}`}
                                >
                                    {h === effectiveDateCol ? '📅 ' + h : h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={orderedHeaders.length} className="px-3 py-6 text-center text-gray-400 text-sm">Loading...</td></tr>
                        ) : processedRows.length === 0 ? (
                            <tr><td colSpan={orderedHeaders.length} className="px-3 py-6 text-center text-gray-400 text-sm">
                                {searchTerm ? 'No matching subscriber names found.' : 'No data for this range.'}
                            </td></tr>
                        ) : (
                            processedRows.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className={`hover:bg-blue-50/30 transition-colors duration-150 ${
                                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                                    }`}
                                >
                                    {orderedHeaders.map(h => (
                                        <td
                                            key={h}
                                            className={`px-3 py-2 text-xs text-gray-700 ${getColumnWidthClass(h)}`}
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

            <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 bg-gray-50/50">
                Showing {processedRows.length} of {rows.length} rows
            </div>
        </div>
    );
}