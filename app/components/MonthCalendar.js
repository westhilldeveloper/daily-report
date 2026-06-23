'use client';

import { useState, useEffect } from 'react';

export default function MonthCalendar({ onDateSelect, selectedDate }) {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [datesWithData, setDatesWithData] = useState(new Set());
    const [loading, setLoading] = useState(false);

    // ─── Fetch available months ──────────────────────────────────
    useEffect(() => {
        fetch('/api/calendar?months=true')
            .then(res => res.json())
            .then(data => {
                if (data.months) {
                    setMonths(data.months);
                    if (data.months.length) {
                        // Default to the latest month (first in list)
                        const latest = data.months[0];
                        setSelectedMonth(latest);
                    }
                }
            })
            .catch(console.error);
    }, []);

    // ─── Fetch dates for selected month ──────────────────────────
    useEffect(() => {
        if (!selectedMonth) return;
        setLoading(true);
        fetch(`/api/calendar?month=${selectedMonth}`)
            .then(res => res.json())
            .then(data => {
                if (data.dates) {
                    setDatesWithData(new Set(data.dates));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedMonth]);

    // ─── Build calendar grid ──────────────────────────────────────
    const renderCalendar = () => {
        if (!selectedMonth) return <p className="text-sm text-gray-400">No data available.</p>;

        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0=Sun, 1=Mon, ...

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date().toISOString().slice(0, 10);

        const cells = [];

        // Empty cells for days before month start
        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
            const hasData = datesWithData.has(dateStr);
            const isToday = dateStr === today;

            cells.push(
                <button
                    key={day}
                    onClick={() => onDateSelect(dateStr)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-150 ${
                        isToday ? 'ring-2 ring-blue-400' : ''
                    } ${
                        hasData
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer'
                    }`}
                    title={hasData ? 'Data available' : 'No data'}
                >
                    <span>{day}</span>
                    {hasData && (
                        <span className="text-xs ml-0.5 text-emerald-600">✓</span>
                    )}
                    {!hasData && selectedDate && (
                        <span className="text-xs ml-0.5 text-gray-400">✗</span>
                    )}
                </button>
            );
        }

        return (
            <div className="mt-2">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
                    {weekDays.map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-1">
                    {cells}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex items-center gap-4 mb-2">
                <label className="text-sm font-medium text-gray-700">📆 Select Month:</label>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {months.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                    {months.length === 0 && <option>No data</option>}
                </select>
                {loading && <span className="text-sm text-gray-400">Loading...</span>}
            </div>
            {selectedMonth && (
                <div className="text-sm font-medium text-gray-600 mb-1">
                    {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
            )}
            {renderCalendar()}
            <div className="mt-2 text-xs text-gray-400 flex gap-4">
                <span><span className="text-emerald-600">✓</span> Data uploaded</span>
                <span><span className="text-gray-400">✗</span> No data</span>
            </div>
        </div>
    );
}