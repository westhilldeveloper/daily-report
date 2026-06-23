'use client';

import {
    ListFilter,
    Calendar,
    CalendarDays,
    SlidersHorizontal,
    Check,
    Database,
    X
} from 'lucide-react';

export default function FilterBar({
    filterType,
    setFilterType,
    filterDate,
    setFilterDate,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    onApplyCustom,
    count,
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-wrap items-center gap-3">
                {/* Filter label with icon */}
                <div className="flex items-center gap-1.5 mr-1">
                    <ListFilter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { type: 'all', label: 'All', icon: ListFilter },
                        { type: 'week', label: 'This Week', icon: Calendar },
                        { type: 'month', label: 'This Month', icon: CalendarDays },
                        { type: 'custom', label: 'Custom', icon: SlidersHorizontal },
                    ].map(({ type, label, icon: Icon }) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                filterType === type
                                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Date inputs */}
                <div className="flex items-center gap-2 ml-1">
                    {filterType === 'week' && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                        </div>
                    )}
                    {filterType === 'month' && (
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="month"
                                value={filterDate.slice(0, 7)}
                                onChange={(e) => setFilterDate(e.target.value + '-01')}
                                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                        </div>
                    )}
                    {filterType === 'custom' && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>
                            <span className="text-xs text-gray-400">→</span>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={onApplyCustom}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Apply
                            </button>
                        </div>
                    )}
                </div>

                {/* Row count */}
                <div className="flex items-center gap-1.5 ml-auto text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <Database className="w-3.5 h-3.5" />
                    <span>{count} row{count !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    );
}