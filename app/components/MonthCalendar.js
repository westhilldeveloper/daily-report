'use client';

import { useState, useEffect } from 'react';

export default function MonthCalendar({ onDateSelect, selectedDate, onClose }) {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [datesWithData, setDatesWithData] = useState(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/calendar?months=true')
            .then(res => res.json())
            .then(data => {
                if (data.months) {
                    setMonths(data.months);
                    if (data.months.length) {
                        const latest = data.months[0];
                        setSelectedMonth(latest);
                    }
                }
            })
            .catch(console.error);
    }, []);

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

    const handleDateClick = (dateStr) => {
        onDateSelect(dateStr);
        if (onClose) onClose(); // close calendar after selection
    };

    const renderCalendar = () => {
        if (!selectedMonth) return <p className="text-xs text-gray-400">No data available.</p>;

        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        // Adjust for Monday start (European standard)
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Sun=0 → 6, Mon=1 → 0
        const today = new Date().toISOString().slice(0, 10);

        const cells = [];

        for (let i = 0; i < adjustedFirstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
            const hasData = datesWithData.has(dateStr);
            const isToday = dateStr === today;

            cells.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(dateStr)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-150 ${
                        isToday ? 'ring-2 ring-blue-400' : ''
                    } ${
                        hasData
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={hasData ? 'Data available' : 'No data'}
                >
                    <span>{day}</span>
                    {hasData && <span className="text-[10px] ml-0.5 text-emerald-600">✓</span>}
                    {!hasData && <span className="text-[10px] ml-0.5 text-gray-400">✗</span>}
                </button>
            );
        }

        return (
            <div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-gray-500">
                    {weekDays.map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-1">
                    {cells}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 w-auto min-w-[220px] relative">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-medium text-gray-700">📅 Month:</label>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {months.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                    {months.length === 0 && <option>No data</option>}
                </select>
                {loading && <span className="text-xs text-gray-400">Loading...</span>}
            </div>

            {selectedMonth && (
                <div className="text-xs font-medium text-gray-600 mb-1">
                    {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
            )}

            {renderCalendar()}

            <div className="mt-2 text-[10px] text-gray-400 flex gap-3">
                <span><span className="text-emerald-600">✓</span> Data</span>
                <span><span className="text-gray-400">✗</span> No data</span>
            </div>
        </div>
    );
}